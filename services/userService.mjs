function generateAccessToken(username) {
  return jwt.sign({ username }, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

class UserService {
  constructor(connection) {
    this.dbConnection = connection
  }
  async register(userID, name, password) {
    const users = this.dbConnection.collection("users");
    const user = await users.findOne({ userID })
    if (user) {
      throw new Error('User with this userID already exists')
    }
    users.insertOne({ userID, name, password })
    return generateAccessToken(userID)
  }

  async login(userID, password) {

  }
}
export default UserService;