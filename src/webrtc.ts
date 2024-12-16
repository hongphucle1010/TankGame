// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  addDoc,
  updateDoc,
  Firestore,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

class WebRTC {
  private app: FirebaseApp;
  private firestore: Firestore;
  private pc: RTCPeerConnection;
  private dataChannel: RTCDataChannel | null;
  dataChannelOpen: Promise<void>;
  private resolveDataChannelOpen!: () => void;
  onDataReceived: (data: WebRTCData) => void = () => {};

  constructor(firebaseConfig: FirebaseConfig) {
    this.app = initializeApp(firebaseConfig);
    this.firestore = getFirestore(this.app);

    const servers = {
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    };

    this.pc = new RTCPeerConnection(servers);
    this.dataChannel = null;
    this.dataChannelOpen = new Promise((resolve) => {
      this.resolveDataChannelOpen = resolve;
    });

    // Set up ondatachannel handler here to ensure it's ready
    this.pc.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
  }

  private setupDataChannel(): void {
    if (this.dataChannel) {
      this.dataChannel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.onDataReceived(data);
      };
      this.dataChannel.onopen = () => {
        console.log("Data channel is open");
        this.resolveDataChannelOpen();
      };
      this.dataChannel.onclose = () => {
        console.log("Data channel is closed");
      };
    }
  }

  sendData(data: WebRTCData): void {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(JSON.stringify(data));
    }
  }

  async createRoom(roomId: string): Promise<void> {
    const roomRef = doc(this.firestore, "rooms", roomId);
    const roomSnapshot = await getDoc(roomRef);

    if (roomSnapshot.exists()) {
      // Clear existing room data
      const offerCandidates = collection(roomRef, "offerCandidates");
      const answerCandidates = collection(roomRef, "answerCandidates");

      const offerCandidatesSnapshot = await getDocs(offerCandidates);
      offerCandidatesSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      const answerCandidatesSnapshot = await getDocs(answerCandidates);
      answerCandidatesSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      await deleteDoc(roomRef);
    }

    this.dataChannel = this.pc.createDataChannel("dataChannel");
    this.setupDataChannel();

    const offerCandidates = collection(roomRef, "offerCandidates"); // Create a new collection for offer candidates
    const answerCandidates = collection(roomRef, "answerCandidates"); // Create a new collection for answer candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(offerCandidates, event.candidate.toJSON());
      }
    };
    const offerDescription = await this.pc.createOffer();
    await this.pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(roomRef, { offer });

    onSnapshot(roomRef, (snapshot) => {
      const data = snapshot.data();
      if (!this.pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        this.pc.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          this.pc.addIceCandidate(candidate);
        }
      });
    });
  }

  async joinRoom(roomId: string): Promise<void> {
    const roomRef = doc(this.firestore, "rooms", roomId);
    const offerCandidates = collection(roomRef, "offerCandidates");
    const answerCandidates = collection(roomRef, "answerCandidates");

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    const roomSnapshot = await getDoc(roomRef);
    if (roomSnapshot.exists()) {
      const data = roomSnapshot.data();
      const offerDescription = data.offer;
      await this.pc.setRemoteDescription(
        new RTCSessionDescription(offerDescription)
      );

      const answerDescription = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await updateDoc(roomRef, { answer });

      onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const candidate = new RTCIceCandidate(change.doc.data());
            this.pc.addIceCandidate(candidate);
          }
        });
      });

      onSnapshot(answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const candidate = new RTCIceCandidate(change.doc.data());
            this.pc.addIceCandidate(candidate);
          }
        });
      });

      this.pc.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannel();
      };
    } else {
      console.error("Room does not exist");
    }
  }
}

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

export interface WebRTCData {
  type: "ask" | "answer";
  topic:
    | "wall"
    | "player"
    | "bullet"
    | "name"
    | "ready"
    | "keyState"
    | "position"
    | "shoot";
  data?: string;
}

const webrtc = new WebRTC(firebaseConfig);
export default webrtc;
