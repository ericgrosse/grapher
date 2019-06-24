import React from 'react'
import './App.scss'

function Table(props) {
  return (
    <div className="Table">
      {
        props.data.map((column, index) => (
          <Column
            key={index}
            column={column}
            index={index}
            onChange={props.onChange}
          />
        ))
      }
    </div>
  )
}

function Row(props) {
  return (
    <div className="Row">
      <input
        key={`row${props.row}:column${props.column}`}
        type="text"
        value={props.cell}
        onChange={props.onChange.bind(this, props.row, props.column)}
      />
    </div>
  )
}

function Column(props) {
  return (
    <div className="Column">
      {
        props.column.map((row, index) => (
          <Row
            key={index}
            cell={row}
            row={index}
            column={props.index}
            onChange={props.onChange}
          />
        ))
      }
    </div>
  )
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      table: [['x', 1, 2, 3], ['sin(x)', 0.84, 0.91, 0.14]]
    }
  }

  handleChangeCell = (row, column, evt) => {
    const tableDeepCopy = this.state.table.slice().map(x => x.slice())
    tableDeepCopy[column][row] = evt.target.value
    this.setState({ table: tableDeepCopy })
  }

  render() {
    return (
      <div className="App">
        <h1>Grapher</h1>
        
        <Table
          data={this.state.table}
          onChange={this.handleChangeCell}
        />
      </div>
    )
  }
}

export default App
