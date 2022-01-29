"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerHostProcess = exports.WorkerRPC = void 0;
/**
 * The page side of the work instance, handles RPC and Tasks
 */
class WorkerRPC {
    constructor(workerScriptURL) {
        this.currentUniqueID = 0;
        this.idCallbacks = new Map();
        this.worker = new Worker(workerScriptURL);
        this.worker.onmessage = (event) => {
            const msg = event.data;
            if (this.idCallbacks.has(msg.instanceID)) {
                this.idCallbacks.get(msg.instanceID)(msg);
            }
        };
    }
    newUniqueID() {
        this.currentUniqueID += 1;
        return "ID" + this.currentUniqueID;
    }
    rpc(path, ...args) {
        return new Promise((resolve, reject) => {
            const msgID = this.newUniqueID();
            this.idCallbacks.set(msgID, (message) => {
                if (message.type == "rpc-result") {
                    this.idCallbacks.delete(msgID);
                    resolve(message.returnValue);
                }
                if (message.type == "rpc-error") {
                    this.idCallbacks.delete(msgID);
                    reject(new Error(message.errorMessage));
                }
            });
            this.worker.postMessage({
                type: "rpc-call",
                instanceID: msgID,
                path,
                args,
            });
        });
    }
}
exports.WorkerRPC = WorkerRPC;
class WorkerHostProcess {
    constructor() {
        this.rpcMethods = new Map();
        onmessage = (event) => {
            const message = event.data;
            this.handleMessage(message);
        };
    }
    registerRPC(path, method) {
        this.rpcMethods.set(path, method);
    }
    handleMessage(message) {
        switch (message.type) {
            case "rpc-call":
                {
                    try {
                        const method = this.rpcMethods.get(message.path);
                        if (!method) {
                            postMessage({
                                type: "rpc-error",
                                instanceID: message.instanceID,
                                errorMessage: `RPC method "${message.path}" not found`,
                            }, undefined);
                        }
                        else {
                            const result = method(...message.args);
                            if (result instanceof Promise) {
                                result
                                    .then((returnValue) => {
                                    postMessage({
                                        type: "rpc-result",
                                        instanceID: message.instanceID,
                                        returnValue,
                                    }, undefined);
                                })
                                    .catch((error) => {
                                    postMessage({
                                        type: "rpc-error",
                                        instanceID: message.instanceID,
                                        errorMessage: error.message + "\n" + error.stack,
                                    }, undefined);
                                });
                            }
                            else {
                                postMessage({
                                    type: "rpc-result",
                                    instanceID: message.instanceID,
                                    returnValue: result,
                                }, undefined);
                            }
                        }
                    }
                    catch (e) {
                        postMessage({
                            type: "rpc-error",
                            instanceID: message.instanceID,
                            errorMessage: e.message + "\n" + e.stack,
                        }, undefined);
                    }
                }
                break;
        }
    }
}
exports.WorkerHostProcess = WorkerHostProcess;
//# sourceMappingURL=communication.js.map