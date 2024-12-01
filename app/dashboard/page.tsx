"use client";

import { Power, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

interface Device {
  id: string;
  name: string;
  macAddress: string;
  ipAddress: string;
  isOnline: boolean;
}

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSaveDevice = () => {
    // TODO: Implement device saving logic
    setModalOpen(false);
  };

  return <div className="p-8">123</div>;
}
