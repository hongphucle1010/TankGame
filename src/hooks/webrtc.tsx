import { useEffect, useState } from "react";
import webrtc, { WebRTCData } from "../webrtc";

export const useReceivingWebRTC = () => {
  const [receivedData, setReceivedData] = useState<WebRTCData | null>(null);

  useEffect(() => {
    console.log("Received data:", receivedData);
  }, [receivedData]);

  useEffect(() => {
    webrtc.onDataReceived = (data) => {
      setReceivedData(data);
    };
  }, []);

  return receivedData;
};
