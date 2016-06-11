import React, { PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { List } from 'immutable';

const { array, func, number, shape } = PropTypes;

const mapDispatchTodo((dispatch, props) => {
  return {
    destroy: () =>
      dispatch({
        id: props.id,
        action: props.actions.destroy(payload),
      })
  }
})

@nestedDispatch((props => return { { id: props.id} } ), todoModule)
class TodoItem extends React.Component {
  render() {
    const {title, description, checked, destroy, update} = props
    return (
      <li>
        <div className="checkbox">
          <input
            onChange={e => {
                return dispatch({
                  type: 'todo/UPDATE',
                  todo: {checked: e.target.checked},
                });
              }
            }
            type='checkbox'
            checked={checked}
          />
        </div>
        <p>
          {description}
        </p>
        <aside>
          <button onClick={() => dispatch({ type: 'todo/DESTROY' }) }>
            Delete Todo
          </button>
        </aside>
      </li>
    );
  }
}

export default class TodoList extends React.Component {
  static propTypes = {
    todos: shape({
      collection: array,
      actions: shape({
        create: func,
        destroy: func,
        update: func,
      }),
    }),
  };

  render() {
    const { title, todos: todoProps } = this.props;
    const { collection = [], actions } = todoProps ;

    return (
      <div>
        <h1>{title}</h1>

        <div>
          <label>Description</label>
          <input ref='description'/>

          <input
            type='button'
            value='Create'
            onClick={() => {
              actions.create({
                todo: {
                  description: findDOMNode(this.refs.description).value,
                }
              })
            }}
          />
        </div>

        <ul>
          {collection.map((todo, i) =>
            <TodoItem
              key={i}
              actions={mapDispatchTodo(actions.todos)}
              destroy={actions.destroy}
              { ... todo }
            />
          )}
        </ul>
      </div>
    );
  }
}
