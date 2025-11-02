const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');

global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;

// Polyfill para IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }
  observe(target) {
    // Simula que o elemento está visível imediatamente
    this.callback([{ isIntersecting: true, target: target }], this);
  }
  unobserve() {}
  disconnect() {}
};

// Polyfill melhorado para MutationObserver (para corrigir o crash do auto-reload)
global.MutationObserver = class MutationObserver {
  constructor(callback) {
    // Salva a função de callback que o lozad registra
    this.callback = callback;
  }
  observe(target, options) {
    // Simula imediatamente um evento de mutação para o teste de auto-reload
    this.callback([], this);
  }
  disconnect() {}
  takeRecords() { return []; }
};

// Polyfill para requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};