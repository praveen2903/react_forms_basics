import { useEffect, useState } from 'react';
import axios from 'axios';
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
        const res = await axios.get<LocationItem[]>('http://localhost:4000/locations');
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
