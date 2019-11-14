const googleSpreadSheet = require('google-spreadsheet')
const credentials = require('./bugtracker.json')
const { promisify } = require('util')

const addRowToSheet = async() => {
    try {
        const doc = new googleSpreadSheet('1LuCl91CgOMMkqgujyHc6_CoGrZZSeXPlDgjzMbaGpEM')
        await promisify(doc.useServiceAccountAuth)(credentials)
        console.log('Planilha aberta com sucesso!!')
        const info = await promisify(doc.getInfo)()
        const worksheet = info.worksheets[0]
        await promisify(worksheet.addRow)({ nome: 'Giseli Nunes', email: 'giseli-nunes@gmail.com' })
        console.log('Linha inserida!')
    } catch (error) {
        console.log('Temos um erro:', error)
    }
}

addRowToSheet()

// const doc = new googleSpreadSheet('1LuCl91CgOMMkqgujyHc6_CoGrZZSeXPlDgjzMbaGpEM')

// doc.useServiceAccountAuth(credentials, (error) => {
//     if (error) {
//         console.log('Não foi possível abrir a planilha!')
//     } else {
//         console.log('Planilha aberta com sucesso!!')
//         doc.getInfo((error, info) => {
//             
//             worksheet.addRow({ nome: 'Eric Nunes', email: 'eric-nunes@gmail.com' }, (error) => {
//                 console.log('Linha inserida!')
//             })
//         })
//     }
// })