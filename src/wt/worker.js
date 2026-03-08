import { parentPort } from "worker_threads";

const sortArray = (array) => {
 return array.sort((a, b) => a - b);
};

parentPort.on("message", (data) => {
 const sortedArray = sortArray(data);
 parentPort.postMessage(sortedArray);
});

parentPort.on("error", (error) => {
 parentPort.postMessage(error);
});
