const axios = require('axios')

export const getNotes = async () => {
    const response = await axios.get('localhost:8080/notes')
    console.log(response.data)
    return response.data
}

