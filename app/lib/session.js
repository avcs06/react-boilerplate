import Promise from 'bluebird';

class Session {
    constructor() {
        this.active = null;
        this.started = 0;
        this.completed = 0;
    }

    track(...args) {
        const activePromise = this.active || Promise.resolve();
        const apis = Array.prototype.concat.apply([], args);

        this.started++;
        apis.push(activePromise);
        this.active = Promise.all(apis).finally(() => {
            this.completed++;
            if(this.started === this.completed) {
                this.active = null;
            }
        });
    }

    done() {
        return new Promise(resolve => {
            if(this.active) {
                this.active.finally(() => {
                    this.done().then(resolve);
                });
            } else {
                resolve();
            }
        });
    }
}

export default new Session();
