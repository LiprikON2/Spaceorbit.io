import { CircularBuffer } from "./CircularBuffer";

export class PingBuffer extends CircularBuffer {
    buffer: number[] = [];
    _avgDebounced: number = null;

    push(element: number) {
        super.push(Math.abs(element));
    }

    get avg() {
        if (this.buffer.length) {
            const sum = this.buffer.reduce((acc, cur) => acc + cur);
            const average = sum / this.buffer.length;
            return Math.floor(average);
        }
        return 0;
    }

    get avgDebounced() {
        const timeToResample = this.pointer === this.bufferLength / 2;
        if (!this._avgDebounced || timeToResample) {
            this._avgDebounced = this.avg;
        }
        return this._avgDebounced;
    }
}
