import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 50, // 50 Virtual Users hitting the server at the same time
  duration: '10s', // Run the test for 10 seconds
};

export default function () {
  http.get('http://localhost:3000/buy');
  sleep(0.1); // Wait 100ms between clicks
}