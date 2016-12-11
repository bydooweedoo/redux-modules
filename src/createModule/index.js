import { forEach, get, identity, map, snakeCase } from 'lodash';

import createAction from './createAction';

function applyReducerEnhancer(reducer, enhancer) {
  if (typeof enhancer === 'function') {
    return enhancer(reducer);
  }
  return reducer;
}

function formatType(actionName) {
  return snakeCase(actionName).toUpperCase();
}

function parseTransformation(transformation, actionName) {
  if (typeof actionName !== 'string') {
    throw new Error('`transformations` value must be an object');
  }

  const type = formatType(actionName);

  if (typeof transformation === 'function') {
    return {
      actionName,
      reducer: transformation,
      type,
    };
  }
  return {
    actionName,
    type,
    ...transformation,
  };
}

export default function createModule({ composes = [], initialState, middleware: moduleMiddleware = [], name, reducerEnhancer, selector, transformations }) {
  const parsedTransformations = map(transformations, parseTransformation);
  const actions = {};
  const constants = {};
  const reducerMap = {};
  forEach(parsedTransformations,
    ({ actionName, middleware = [], namespaced = true, reducer, type }) => {
      const finalMiddleware = [...middleware, ...moduleMiddleware];
      const constant = namespaced ? `${name}/${type}` : type;
      actions[actionName] = createAction(constant, finalMiddleware);
      constants[actionName] = constant;
      reducerMap[constant] = reducer;
    });
  function finalReducer(state = initialState, action) {
    const localReducer = get(reducerMap, action.type, identity);
    return [localReducer, ...composes]
      .reduce((newState, currentReducer) => currentReducer(newState, action), state);
  }
  return {
    actions,
    constants,
    name,
    reducer: applyReducerEnhancer(finalReducer, reducerEnhancer),
    selector,
  };
}
