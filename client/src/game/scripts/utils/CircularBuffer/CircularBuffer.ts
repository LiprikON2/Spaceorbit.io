export class CircularBuffer {
    /**
     * Last bufferLength number of elements
     */
    #buffer = [];
    /**
     * Value between 0 and bufferLength
     */
    pointer = 0;
    /**
     * Max buffer length
     */
    bufferLength: number;

    constructor(bufferLength = 10) {
        this.bufferLength = bufferLength;
    }

    push(element: any) {
        if (this.#buffer.length === this.bufferLength) {
            this.#buffer[this.pointer] = element;
        } else {
            this.#buffer.push(element);
        }
        this.pointer = (this.pointer + 1) % this.bufferLength;
    }

    get(i: number) {
        return this.#buffer[i];
    }

    // Gets the i-th element before last one
    getLast(i: number) {
        return this.#buffer[this.pointer + this.bufferLength - 1 - i];
    }
}
