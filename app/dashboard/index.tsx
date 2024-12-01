import {
  Card,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Modal,
  Input,
} from "@nextui-org/react";
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">设备管理</h2>
        <Button onPress={() => setModalOpen(true)}>添加设备</Button>
      </div>

      <div className="w-full">
        <Table>
          <TableHeader>
            <TableColumn>设备名称</TableColumn>
            <TableColumn>MAC 地址</TableColumn>
            <TableColumn>IP 地址</TableColumn>
            <TableColumn>状态</TableColumn>
            <TableColumn>操作</TableColumn>
          </TableHeader>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>{device.name}</TableCell>
                <TableCell>{device.macAddress}</TableCell>
                <TableCell>{device.ipAddress}</TableCell>
                <TableCell>
                  <Chip color={device.isOnline ? "success" : "danger"}>
                    {device.isOnline ? "在线" : "离线"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      variant="light"
                      onPress={() => handleWakeDevice(device.id)}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button
                      isIconOnly
                      variant="light"
                      onPress={() => handleEditDevice(device.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      isIconOnly
                      variant="light"
                      color="danger"
                      onPress={() => handleDeleteDevice(device.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
