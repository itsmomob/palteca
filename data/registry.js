window.__topics = [];
window.__grammar = [];

window.registerTopic = function (topic) {
  if (!topic || !topic.id) return console.warn("registerTopic: missing id", topic);
  window.__topics.push(topic);
};

window.registerGrammar = function (point) {
  if (!point || !point.id) return console.warn("registerGrammar: missing id", point);
  window.__grammar.push(point);
};
