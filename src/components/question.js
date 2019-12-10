import React, {Component} from 'react'
import styled from 'styled-components'

import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import Alert from 'react-bootstrap/Alert'

import Cache from './cache'

export default class Question extends Component{
    constructor(props){
        super(props)
        
        this.state={
          mods:     [],
          answers:  [],
          valid:    false,
          show:     false,
        }
        
    }

    componentDidMount(){
      let temp = []
      let ans = []
      if(Cache.state.currentCol.Mods.length > 0){
        
        Cache.state.currentCol.Mods.map(
          item => {
            ans.push([])
            if( typeof item.modQuestions === "string"){
              item.modQuestions = JSON.parse(item.modQuestions)
            }
            return temp.push(item)
          }
        )
        
      }

      if(Cache.state.currentExh.exhMods.length > 0){
        Cache.state.currentExh.exhMods.map(
          item => {
            ans.push([])
            return temp.push(item)
          }
        )
      }
      this.setState({mods: temp, answers: ans})
    }

    Alert() {
      if (this.state.show) {
        return (
          <Alert variant="danger" onClose={() => this.setState({show: false})} dismissible>
            <Alert.Heading>Error!</Alert.Heading>
            <p>
              You have not completed all the questions. 
              Please finish any uncompleted questions and try again.
            </p>
          </Alert>
        );
      }
   }

    validate(){
      let res = true
      let ans = this.state.answers
      let mods = this.state.mods

      for(let i = 0; i < ans.length; i++){
        if(ans[i].length !== mods[i].modQuestions.length){
          res = false
          break
        }
        else if(ans[i].includes(null) || ans[i].includes("") ){
          res = false
          break
        }
      }
      return res
    }

    saveAns(ans, key){
      let temp = this.state.answers

      if(temp[key.mod].length !== key.ques){
        while(temp[key.mod].length < key.ques){
          temp[key.mod].push(null)
        }
      }
      temp[key.mod][key.ques] = ans
      
      this.setState({answers: temp})
    }

    showQuestion(ques, key){
      switch (ques.qType) {
        //Text questions
        //Single Line Free Text
        case "SLFT":
            return(
              <ModQ>
                <h6>{ques.qTitle}</h6>
                <InputGroup>
                  <FormControl placeholder="Input Text" onChange={ (e)=>this.saveAns(e.target.value, key) } />
                  {
                    ques.qExtra.other
                    ?
                    <FormControl placeholder="Other" onChange={ (e)=>this.saveAns(e.target.value, key) } />
                    :
                    null
                  }
                </InputGroup>
              </ModQ>
            )
        //Multi Line Free Text
        case "MLFT":
            return(
              <ModQ>
                <h6>{ques.qTitle}</h6>
                <InputGroup>
                  <FormControl as="textarea" placeholder="Input Text" onChange={ (e)=>this.saveAns(e.target.value, key) } />
                  {
                    ques.qExtra.other
                    ?
                    <FormControl placeholder="Other" onChange={ (e)=>this.saveAns(e.target.value, key) } />
                    :
                    null
                  }
                </InputGroup>
              </ModQ>
            )
        //Scale Questions
        //Scale Binary
        case "SCABIN":
            return(
              <ModQ>
                <h6>{ques.qTitle}</h6>
                <ButtonToolbar>
                  <ToggleButtonGroup type="radio" name={ques.qTitle} onChange={ (e)=>this.saveAns(e, key) } >
                    <ToggleButton variant="outline-secondary" value={true}  >{ques.qExtra.yes}</ToggleButton>
                    <ToggleButton variant="outline-secondary" value={false} >{ques.qExtra.no}</ToggleButton>
                  </ToggleButtonGroup>
                  {
                    ques.qExtra.other
                    ?
                    <FormControl placeholder="Other" onChange={ (e)=>this.saveAns(e.target.value, key) } />
                    :
                    null
                  }
                </ButtonToolbar>
              </ModQ>
            )
        //Scale Likert
        case "SCALIK":
          return(
            <ModQ>
              <h6>{ques.qTitle}</h6>
              <ButtonToolbar>
                <ToggleButtonGroup type="radio" name={ques.qTitle} onChange={ (e)=>this.saveAns(e, key) } >
                  <ToggleButton variant="outline-secondary" value={0} >{ques.qExtra.min}</ToggleButton>
                  <ToggleButton variant="outline-secondary" value={1} style={{width: '45px'}}></ToggleButton>
                  <ToggleButton variant="outline-secondary" value={2} style={{width: '45px'}}></ToggleButton>
                  <ToggleButton variant="outline-secondary" value={3} style={{width: '45px'}}></ToggleButton>
                  <ToggleButton variant="outline-secondary" value={4} >{ques.qExtra.max}</ToggleButton>
                </ToggleButtonGroup>
                {
                  ques.qExtra.other
                  ?
                  <FormControl placeholder="Other" onChange={ (e)=>this.saveAns(e.target.value, key) } />
                  :
                  null
                }
              </ButtonToolbar>
            </ModQ>
          )
        //Scale Custom
        case "SCACUS":
          let arr = []
          for(let i = 0; i < parseInt(ques.qExtra.step); i++){
            arr.push(i)
          }
          return(
            <ModQ>
              <h6>{ques.qTitle}</h6>
              <ButtonToolbar>
                <ToggleButtonGroup type="radio" name={ques.qTitle} onChange={ (e)=>this.saveAns(e, key) } >
                  {
                    arr.map(
                      item =>{
                        return <ToggleButton variant="outline-secondary" 
                                value={
                                  item === 0 
                                  ?
                                    parseInt(ques.qExtra.min)
                                  :
                                    parseInt(ques.qExtra.min) + item
                                } 
                                >{ item === 0 ? ques.qExtra.min : item === parseInt(ques.qExtra.step) - 1 ? ques.qExtra.max : null }</ToggleButton>
                      }
                    )
                  }
                </ToggleButtonGroup>
                {
                  ques.qExtra.other
                  ?
                  <FormControl placeholder="Other" onChange={ (e)=>this.saveAns(e.target.value, key) } />
                  :
                  null
                }
              </ButtonToolbar>
            </ModQ>
          )
        //Choice Questions
        //Choice Single
        case "CHOSIN":
            return(
              <ModQ>
                <h6>{ques.qTitle}</h6>
                <ButtonToolbar>
                  <ToggleButtonGroup type="radio" name={ques.qTitle} vertical onChange={ (e)=>this.saveAns(e, key) } >
                    {
                      ques.qExtra.choiceList.map(
                        (item, i) =>{
                          return <ToggleButton variant="outline-secondary" value={i} >{ item }</ToggleButton>
                        }
                      )
                    }
                  </ToggleButtonGroup>
                  {
                    ques.qExtra.other
                    ?
                    <FormControl placeholder="Other" onChange={ (e)=>this.saveAns(e.target.value, key) } />
                    :
                    null
                  }
                </ButtonToolbar>
              </ModQ>
            )
        //Choice Multiple
        case "CHOMUL":
            return(
              <ModQ>
                <h6>{ques.qTitle}</h6>
                <ButtonToolbar>
                  <ToggleButtonGroup type="checkbox" vertical onChange={ (e)=>this.saveAns(e, key) } >
                    {
                      ques.qExtra.choiceList.map(
                        (item, i) =>{
                          return <ToggleButton variant="outline-secondary" value={i} >{ item }</ToggleButton>
                        }
                      )
                    }
                  </ToggleButtonGroup>
                  {
                    ques.qExtra.other
                    ?
                    <FormControl placeholder="Other" onChange={ (e)=>this.saveAns(e.target.value, key) } />
                    :
                    null
                  }
                </ButtonToolbar>
              </ModQ>
            )
        default:
          console.log("Other:" + ques.qType)
          break;
      }
    }

    render(){
      return (
        <Body>
          <Button variant="secondary" onClick={this.props.return} >Back</Button><br/>
          <h3>{Cache.state.currentExh.exhName}</h3>
          {
            this.state.mods.length > 0
            ?
              this.state.mods.map(
                (item,i) => {
                  return <div key={i} ><h4>{item.modName}</h4> {
                    item.modQuestions.map(
                      (elem, d) => {
                        let key = { mod: i, ques: d }
                        return this.showQuestion(elem, key)
                      }
                    )
                  } </div>
                }
              )
            :
            null
          }
          {this.Alert()}
          <Button variant="secondary" onClick={()=>{
            if(this.validate()){
              Cache.updateUser(this.state.answers, this.state.mods)
              Cache.state.completedExh.push("" + Cache.state.currentCol.ID + Cache.state.currentExh.exhID)
              this.props.return()
            }
            else{
              this.setState({show: true})
              console.log("Something went wrong")
            }
          }} >Finish</Button>
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
const ModQ = styled.div`
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
`