import Axios from 'axios'
import { addr } from './config'
/*
 * Class to store cached data during the session
 * Class will be unique in the program
 */
class Cache{
  constructor(){
      this.state ={
        USER:         "",
        userList:     [],
        userObj:      [],
        collection:   [],
        currentCol:   {},
        currentExh:   {},
        completedExh: []
      }
  }

  sendCollection(obj){
    //Update collection table

    Axios.get(addr + "/DBStorage/Collection/" + this.state.currentCol.ID)
    .then(
      res => {
        let ans = res.data[0]

        ans.colAns = JSON.parse(ans.colAns)
        ans.colPar = JSON.parse(ans.colPar)

        return ans
      }
    )
    .then(
      data =>{
        if( !data.colPar.includes(this.state.USER) ) data.colPar.push(this.state.USER)
        data.colAns.push(obj)

        return data
      }
    )
    .then(
      object =>{

        let req ={
          "colID":  object.colID,
          "colPar": JSON.stringify(object.colPar),
          "colAns": JSON.stringify(object.colAns)
        }

        Axios.post(addr + "/DBStorage/Collection/", Object(req))
        .catch(err => console.log(err))
      }
    )
    .catch(err => console.log(err))

    
  }

  sendParticipant(obj){
    //Update participant table
    let req ={
      "parID": this.state.USER,
      "parCol": JSON.stringify(obj.parCol),
      "parAns": JSON.stringify(obj.parAns)
    }

    Axios.post(addr +"/DBStorage/Participants/", Object(req))
    .catch(err=>console.log(err))
  }

  updateUser(ans, mods){
    let currUser = this.state.userObj[this.state.userList.indexOf(this.state.USER)]
    if( typeof currUser.parCol === "string" ) currUser.parCol = JSON.parse(currUser.parCol)
    if(!currUser.parCol.includes(this.state.currentCol.ID)) currUser.parCol.push(this.state.currentCol.ID)

    let temp = []

    for(let i = 0; i < ans.length; i++){
      temp.push(
        {
          modID: mods[i].modID,
          ans: ans[i]
        }
      )
    }

    let ansTemp = {
      parID: this.state.USER,
      exhID: this.state.currentExh.exhID,
      ans: temp
    }

    let sendTemp = 
    {
      colID: this.state.currentCol.ID,
      exhID: this.state.currentExh.exhID,
      ans: temp
    }
    if( typeof currUser.parAns === "string" ) currUser.parAns = JSON.parse(currUser.parAns)
    currUser.parAns.push(sendTemp)

    this.sendParticipant(currUser)
    this.sendCollection(ansTemp)
  }

  createUser(user){
    let req = {
        "parID": user,
        "parCol": "[]",
        "parAns": "[]"
    }
    Axios.post(addr +"/DBStorage/Participants/", Object(req))
    .catch(err => console.log(err))

    this.state.USER = user
    this.state.userList.push(user)
    this.state.userObj.push({
      "parID": user,
      "parCol": "[]",
      "parAns": "[]"
    })
  }

  checkUser(user){
    if(this.state.userList.includes(user)){
        let temp = this.state.userObj[this.state.userList.indexOf(user)]
        let ans = temp.parAns.slice(0)
        ans = JSON.parse(ans)

        if(ans.length > 0){
          let keys = []
          for(let i = 0; i < ans.length; i++){
            keys.push("" + ans[i].colID + ans[i].exhID)
          }
          this.state.completedExh = keys
        }
        return true
    }
    return false
  }

  createCache(){
    //Get participant list
    this.createParticipantList()
    this.createCollectionList()
  }

  createCollectionList(){
    Axios.get(addr +"/DBCalls/")
      .then( res => {
              let temp = res.data
              let col = []
              
              temp.forEach(element => {
                let exh = []
                let mod = []

                JSON.parse(element.colExh).forEach(
                  item => {
                      return exh.push(JSON.parse(item))
                    }
                )
                JSON.parse(element.colMods).forEach(
                    item => {
                        return mod.push(JSON.parse(item))
                    }
                )

                let details = {
                    ID: element.colID, 
                    Name: element.colName, 
                    Exhibits: exh, 
                    Mods: mod
                }

                col.push(details)
                
              })
              this.state.collection = col
          })
          
  }

  createParticipantList(){
    Axios.get(addr +"/DBStorage/Participants/")
    .then( res => {
            let temp =     []
            let tempList = []
            res.data.map(
                item =>{
                  return (
                    temp.push(item.parID),
                    tempList.push(item)
                  )
                }
            )
            this.state.userList = temp
            this.state.userObj =  tempList
        })
    .catch(err => console.log(err))
  }

}

export default Cache = new Cache();