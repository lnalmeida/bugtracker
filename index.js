const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const { promisify } = require('util')
const mailer = require('@sendgrid/mail')
const modal = require('micromodal')

const googleSpreadSheet = require('google-spreadsheet')
const credentials = require('./bugtracker.json')

const app = express()

sendGridKey = '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'
const docID = '1LuCl91CgOMMkqgujyHc6_CoGrZZSeXPlDgjzMbaGpEM'
const worksheetIndex = 0

app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'views'))

app.use(bodyParser.urlencoded({ extended: true }))


app.get('/', (req, res) => {
    res.render('home')
})

app.post('/', async(req, res) => {
    try {
        const doc = new googleSpreadSheet(docID)
        await promisify(doc.useServiceAccountAuth)(credentials)
        const info = await promisify(doc.getInfo)()
        const worksheet = info.worksheets[worksheetIndex]
        await promisify(worksheet.addRow)({
            nome: req.body.name,
            email: req.body.email,
            classificacao: req.body.issueType,
            fonte_erro: req.query.source || 'DIRETO',
            reprod_erro: req.body.howToReproduce,
            saida_esperada: req.body.expectedOutput,
            saida_recebida: req.body.receivedOutput,
            userAgent: req.body.userAgent,
            userDate: req.body.userDate
        })
        if (req.body.issueType === 'CRITICAL') {
            try {
                mailer.setApiKey(sendGridKey);
                const msg = {
                    to: 'l.n.almeida.ti@gmail.com',
                    from: 'l.n.almeida@gmail.com',
                    subject: 'Report de Erro - Bugtracker',
                    html: `<h1 style="font-size: 24px;">Erro no sistema</h1>
                    <p style="font-size: 16px;">
                        O usuário ${req.body.name}(${req.body.email}) relatou o erro abaixo em ${req.body.userDate}<br/><br/>
                        Browser: ${req.body.userAgent}<br/>
                        Fonte: ${req.query.source || 'DIRETO'}<br/>
                        Classificação: ${req.body.issueType}<br/>
                        Como reproduzir o erro: ${req.body.howToReproduce}<br/>
                        Saída esperada: ${req.body.expectedOutput}<br/>
                        Saída Recebida: ${req.body.receivedOutput}
                    </p> `,
                }
                await mailer.send(msg)
            } catch (error) {
                res.status(400).render('mailError')
            }
        }
        if (req.body.issueType === 'ENHANCEMENT')
            res.render('enhancement')
        res.render('success')
    } catch (error) {
        res.render('reportError')
        console.log('Temos um erro:', error)
    }
})

const port = process.env.PORT || 5000;

app.listen(port, (error) => {
    if (error) {
        console.log('Erro no servidor: ', error)
    }
    console.log(`BugTracker rodando na porta http://localhost:${port}`)
})