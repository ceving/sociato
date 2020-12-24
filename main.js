import {WfGraph, WfState, WfTask} from './wf-graph.js';

document.addEventListener ('DOMContentLoaded', (event) => {
  customElements.define ('wf-graph', WfGraph);
  customElements.define ('wf-state', WfState);
  customElements.define ('wf-task', WfTask);
});
