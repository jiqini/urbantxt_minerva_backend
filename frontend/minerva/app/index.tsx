import { Redirect } from 'expo-router';

export default function Index() {
  console.log('INDEX.TSX LOADED - Redirecting to start');
  return <Redirect href="/start" />;
}