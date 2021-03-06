'use strict';

var Bluebird = require('bluebird');
var EventEmitter = require('events').EventEmitter;

function SignalListeners() {}

SignalListeners.with = () => {
  var signalListeners = new SignalListeners();

  return signalListeners.add().disposer(() => signalListeners.remove());
};

SignalListeners.prototype.__proto__ = EventEmitter.prototype;

SignalListeners.prototype.add = Bluebird.method(function() {
  this._boundSigInterrupt = () => {
    this.emit('signal', new Error('Received SIGINT signal'));
  };
  process.on('SIGINT', this._boundSigInterrupt);

  this._boundSigTerminate = () => {
    this.emit('signal', new Error('Received SIGTERM signal'));
  };
  process.on('SIGTERM', this._boundSigTerminate);

  return this;
});

SignalListeners.prototype.remove = Bluebird.method(function() {
  if (this._boundSigInterrupt) {
    process.removeListener('SIGINT', this._boundSigInterrupt);
  }
  if (this._boundSigTerminate) {
    process.removeListener('SIGTERM', this._boundSigTerminate);
  }
});

module.exports = SignalListeners;
