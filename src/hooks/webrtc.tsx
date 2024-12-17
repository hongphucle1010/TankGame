import { useEffect, useState, useRef } from "react";
import webrtc, { WebRTCData } from "../webrtc";

export const useReceivingWebRTC = () => {
  const [receivedData, setReceivedData] = useState<WebRTCData | null>(null);
  const dataQueue = useRef<WebRTCData[]>([]);
  const isProcessing = useRef(false);

  useEffect(() => {
    const handleDataReceived = (data: WebRTCData) => {
      // console.log("Data received:", data);
      dataQueue.current.push(data);
      processQueue();
    };

    const processQueue = async () => {
      if (isProcessing.current) return;
      isProcessing.current = true;

      while (dataQueue.current.length > 0) {
        const nextData = dataQueue.current.shift();
        if (nextData) {
          setReceivedData(nextData);
          // Wait for processing to complete before proceeding
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      isProcessing.current = false;
    };

    // Assign the handler directly
    webrtc.onDataReceived = handleDataReceived;

    return () => {
      // Clear the handler on cleanup
      webrtc.onDataReceived = () => {};
    };
  }, []);

  return receivedData;
};
