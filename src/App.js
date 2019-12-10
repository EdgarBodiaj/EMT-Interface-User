import React, {Component} from 'react'
import styled from 'styled-components'

import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Alert from 'react-bootstrap/Alert'

import './App.css'
import Cache from './components/cache'
import { makeid } from './components/functions'
import Question from './components/question'



export default class App extends Component{
    constructor(props){
        super(props)
        
        this.state={
            ID:         "",
            collection: {},
            currentExh: {},
            temp:       "",
            show:       false,
            alert:      ""
        }
        this.returnCollection = this.returnCollection.bind(this)
    }

    Alert() {
      if (this.state.show) {
        let error = ""
        switch (this.state.alert) {
          case "USER":
            error = "Username not recognised or does not exist. Please try again"
            break;
          case "COL":
            error = "Collection not recognised or does not exist. Please try again"
            break;
          default:
            break;
        }

        return (
          <Alert variant="danger" onClose={() => this.setState({show: false})} dismissible>
            <Alert.Heading>Error!</Alert.Heading>
            <p>
              {error}
            </p>
          </Alert>
        );
      }
   }

    returnCollection(){
      Cache.state.currentExh = []

      this.setState({currentExh: []})

      this.forceUpdate()
    }
    
    viewExh(exh){
      //Clone object
      let current = Object.assign({}, exh)
      let temp = []
  
      current.exhMods.map(
        item => {
          return temp.push(JSON.parse(item))
        }
      )
  
      current.exhMods = temp
      Cache.state.currentExh = current

      this.setState({currentExh: current})
    }

    login(){
      return(
        <div>
          <h1>Login</h1>
          <br/>
          <h2>New user</h2>
          <Button size="lg" variant="secondary" onClick={() => {
            Cache.createUser(makeid(4))
            this.forceUpdate()
          } }>Start</Button>
          <br/>
          <h2>Existing user</h2>
          <InputGroup>
            <FormControl 
              placeholder="User ID"
              value={this.state.temp}
              onChange={ e => this.setState({temp: e.target.value}) }
              />
            <InputGroup.Append>
              <Button variant="outline-secondary" onClick={()=> {
                if(Cache.checkUser(this.state.temp)){
                  Cache.state.USER = this.state.temp
                  this.setState({temp: ""})
                }
                else this.setState({show: true, alert: "USER"})
              } } >Search</Button>
            </InputGroup.Append>
            <InputGroup.Append>
              <Button variant="outline-secondary" onClick={()=> this.setState({ temp: "" }) } >Clear</Button>
            </InputGroup.Append>
          </InputGroup>
        </div>
      )
    }

    getCollections(){
      for (let i = 0; i < Cache.state.collection.length; i++) {
        if(Cache.state.collection[i].ID === this.state.ID.toUpperCase()){
          Cache.state.currentCol = Cache.state.collection[i]
          return this.setState({collection: Cache.state.collection[i]})
        }
      }
      this.setState({show: true, alert: "COL"})
    }

    createCard(exh, i){
      return(
        <Card key={i} style={{ width: '18rem' }}>
                <Card.Img variant="top" src={exh.exhIMG} />
                <Card.Body>
                  <Card.Title>{exh.exhName}</Card.Title>
                  <Card.Text>
                    {exh.exhDesc}
                  </Card.Text>
                  {
                    Cache.state.completedExh.includes("" + this.state.collection.ID + exh.exhID )
                    ?
                    <Button variant="secondary" disabled >Complete</Button>
                    :
                    <Button variant="secondary" onClick={() => this.viewExh(exh) } >Begin</Button>
                  }
                  
                </Card.Body>
              </Card>
      )
    }

    selectExhibit(){
      return(
        <div>
          <h3>Your ID: {Cache.state.USER} </h3>
          <br/>
          <InputGroup>
            <FormControl 
              placeholder="Collection ID"
              value={this.state.ID}
              onChange={ e => this.setState({ID: e.target.value}) }
              />
            <InputGroup.Append>
              <Button variant="outline-secondary" onClick={()=> this.getCollections() } >Search</Button>
            </InputGroup.Append>
            <InputGroup.Append>
              <Button variant="outline-secondary" onClick={()=> this.setState({ID:"", collection: {}}) } >Clear</Button>
            </InputGroup.Append>
          </InputGroup>

          <ExhibitGroup>
            {
              this.state.collection.hasOwnProperty("ID")
              ?
              this.state.collection.Exhibits.map(
                (item, i) => {
                  return this.createCard(item, i)
                }
              )
              :
              null
            }
          </ExhibitGroup>
        </div>
      )
    }

    selector(){
      if(Cache.state.USER !== ""){
        if(this.state.currentExh.hasOwnProperty("exhID")){
          return <Question return={()=> this.returnCollection()}/>
        }
        else{
          return this.selectExhibit()
        }
      }
      else{
        return this.login()
      }
    }

    render(){
      return (
        
        <Body className="App">
          {
            this.Alert()
          }
          {
            this.selector()
          }
        </Body>
      )
    }
}

const Body = styled.div`
    margin: 3rem auto;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
`
const ExhibitGroup = styled.div`
    margin: 1.5rem auto;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
`