import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import Chat from './Chat';

interface LocationItem {
  id: number;
  name: string;
}

const ChatPage = () => {
  const [rooms, setRooms] = useState<string[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axiosClient.get<LocationItem[]>('/locations');
        const names = res.data.map(l => l.name);
        setRooms(['General', ...names]);
      } catch {
        setRooms(['General']);
      }
    };
    fetchLocations();
  }, []);

  if (rooms.length === 0) return null;

  return (
    <Chat mode="fullpage" rooms={rooms} defaultRoom="General" />
  );
};

export default ChatPage;
