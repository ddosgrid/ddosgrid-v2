import DataStore from 'nedb';

class Users {
  constructor (dbPath) {
    this.instance = new DataStore({ filename: dbPath, autoload: true })
    this.instance.persistence.setAutocompactionInterval(60000)
  }
  async createOrUpdateUser(id, username, email, firstname, lastname, accesstoken, refreshtoken) {
    var existingUser = await this.findUserById(id)
    if(existingUser) {
      await this.updateUser(id, username, email, firstname, lastname, accesstoken, refreshtoken)
      return this.findUserById(id)
    } else {
      return this.createUser(id, username, email, firstname, lastname, accesstoken, refreshtoken)
    }
  }
  async updateUser(id, name, email, firstname, lastname, accesstoken, refreshtoken) {
    return new Promise((resolve, reject) =>{
      this.instance.update({ id: id }, {
          $set: {
            id: id,
            name: name,
            email: email,
            accesstoken: accesstoken,
            refreshtoken:refreshtoken,
            firstname: firstname,
            lastname: lastname
          }
        }, {}, (err, nrUpdated) => {
        if(err || nrUpdated == 0) { reject(err) }
        resolve()
      })
    })
  }
  async findUserByDBId(id) {
    return new Promise((resolve, reject) => {
      this.instance.findOne({_id: id}, (err, user) => {
        if(err) { reject(err) }
        resolve(user)
      })
    })
  }
  async findUserById(id) {
    return new Promise((resolve, reject) => {
      this.instance.findOne({id: id}, (err, user) => {
        if(err) { reject(err) }
        resolve(user)
      })
    })
  }
  async createUser(id, name, email, firstname, lastname, accesstoken, refreshtoken) {
    return new Promise((resolve, reject) => {
      var user = {
        id: id,
        name: name,
        email: email,
        firstname: firstname,
        lastname: lastname,
        accesstoken: accesstoken,
        refreshtoken: refreshtoken
      }
      this.instance.insert(user, (err, user) => {
        if(err) { reject(err) }
        resolve(user)
      })
    })
  }
}

export default Users;
