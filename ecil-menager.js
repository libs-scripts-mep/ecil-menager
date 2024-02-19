import { Socket } from "../node_modules/@libs-scripts-mep/serialport-websocket/client.js";
import { SerialReqManager, SerialUtil } from "../node_modules/@libs-scripts-mep/serialport-websocket/serial.js";
import { GeneralCompose } from "./general-compose.js";


export default class CappoEcil {

    static serial = new SerialReqManager(9600, `SerialEcil`)
    static nodeAddress = `01`

    static reqGetValues = `01180000000000`
    static regexGetValues = `010`


    static Sensors = { J: '00', K: '01', PT100: '0E' }

    static Configs = {
        ITS: {
            ITS68: 0,
            ITS90: 8
        },
        Compensation: {
            Int: 0,
            Ext: 10
        },
        Scales: {
            Celsius: 0,
            Fahrenheit: 40
        },
        Function: {
            In: 0,
            Out: 20
        },
        DecimalPoint: {
            Yes: 0,
            No: 4
        }
    }

    static async Connect() {
        while (!Socket.IO.connected) { await SerialUtil.Delay(1000); console.log(`CappoEcil: Aguardando conexão com server...`) }

        const discover = await this.serial.portDiscover({ request: this.reqGetValues, regex: this.regexGetValues }, { manufacturer: "FTDI" })
        if (!discover.success) { return { success: false, msg: discover.msg } }

        return { success: true, msg: `CappoEcil: Conexão bem sucedida` }
    }

    static async SetOutputConfig(sensor, temperature, compensation = true) {

        let result, configs, hexValueTemp, checkSum, dataAux = '00';

        if (compensation) {
            configs = parseInt(this.Configs.Compensation.Int + this.Configs.Function.Out + this.Configs.ITS.ITS90 + this.Configs.Scales.Celsius, 16) + this.Configs.DecimalPoint.No
        } else {
            configs = parseInt(this.Configs.Compensation.Ext + this.Configs.Function.Out + this.Configs.ITS.ITS90 + this.Configs.Scales.Celsius, 16) + this.Configs.DecimalPoint.No
        }

        configs = configs.toString(16).toUpperCase()
        hexValueTemp = await this.TransformTempValue(temperature)
        checkSum = (parseInt(hexValueTemp[0] + hexValueTemp[1], 16) + parseInt(hexValueTemp[2] + hexValueTemp[3], 16)).toString(16).toLocaleUpperCase()

        if (parseInt(checkSum, 16) > parseInt('7F', 16) && parseInt(checkSum, 16) <= 256) {

            dataAux = 256 - parseInt(checkSum, 16)
            dataAux = dataAux.toString(16)

            checkSum = (parseInt(hexValueTemp[0] + hexValueTemp[1], 16) + parseInt(hexValueTemp[2] + hexValueTemp[3], 16) + parseInt(dataAux, 16)).toString(16).toLocaleUpperCase()
        }

        checkSum.length == 1 ? checkSum = "0".concat(checkSum) : null
        checkSum.length > 2 ? checkSum = checkSum.substring(1) : null

        result = await this.serial.WatchForResponse({ request: `${this.nodeAddress}19${sensor}000000${sensor}`, regex: `01` })
        if (!result.success) { return { success: false, msg: `Falha na transmissão de dados com o Cappo Ecil.` } }

        result = await this.serial.WatchForResponse({ request: `${this.nodeAddress}1A${configs}000000${configs}`, regex: `01` })
        if (!result.success) { return { success: false, msg: `Falha na transmissão de dados com o Cappo Ecil.` } }

        result = await this.serial.WatchForResponse({ request: `${this.nodeAddress}1B${hexValueTemp[0] + hexValueTemp[1]}${hexValueTemp[2] + hexValueTemp[3]}${dataAux}00${checkSum}`, regex: `01` })
        if (!result.success) { return { success: false, msg: `Falha na transmissão de dados com o Cappo Ecil.` } }


        return { success: true, msg: `Nova configuração recebida` }
    }

    static async setInput(compensation = false) {

        console.group(`Set in Input Cappo`)

        let result, configs;

        if (compensation) {
            configs = parseInt(this.Configs.Compensation.Int + this.Configs.Function.In + this.Configs.ITS.ITS90 + this.Configs.Scales.Celsius, 16)
        } else {
            configs = parseInt(this.Configs.Compensation.Ext + this.Configs.Function.In + this.Configs.ITS.ITS90 + this.Configs.Scales.Celsius, 16)
        }

        configs = configs.toString(16).toUpperCase()
        configs.length == 1 ? configs = "0".concat(configs) : null

        result = await this.serial.WatchForResponse({ request: `${this.nodeAddress}1A${configs}000000${configs}`, regex: `01` })
        if (!result.success) { return { success: false, msg: `Falha na transmissão de dados com o Cappo Ecil.` } }


        console.groupEnd()

        return { success: true, msg: `Nova configuração recebida` }

    }

    static async ReadInput() {

        console.group(`Read Input Cappo`)

        let result = await this.serial.WatchForResponse({ request: `${this.nodeAddress}180000000000`, regex: `0118([A-F]|[0-9]){10}`, readTimeout: 50, maxTries: 10 })
        if (!result.success) { return { success: false, msg: `Falha na transmissão de dados com o Cappo Ecil.` } }

        console.groupEnd()

        return { success: true, response: result.response }

    }

    static async TransformTempValue(number) {

        return new Promise((resolve) => {

            if (number > 0) {

                number = parseInt(number).toString(16).split("")

                switch (number.length) {

                    case 1:
                        resolve([`0`, `0`, `0`, `${number[0].toUpperCase()}`])
                        break

                    case 2:
                        resolve([`0`, `0`, `${number[0].toUpperCase()}`, `${number[1].toUpperCase()}`])
                        break

                    case 3:
                        resolve([`0`, `${number[0].toUpperCase()}`, `${number[1].toUpperCase()}`, `${number[2].toUpperCase()}`])
                        break

                    case 4:
                        resolve([`${number[0].toUpperCase()}`, `${number[1].toUpperCase()}`, `${number[2].toUpperCase()}`, `${number[3].toUpperCase()}`])
                        break

                }

            } else {

                number = number.toString(2).substring(1) // Transforma em binario e retira o sinal negativo

                let numberSize = number.length

                for (let i = 0; i < numberSize; i++) {
                    number = '0'.concat(number) // colocar o numero de 0 que esta faltando para fechar os 16 bits
                }

                number = number.replaceAll(0, 'Aux').replaceAll(1, 0).replaceAll('Aux', 1) // Inverte o numero binario

                number = (Number(parseInt(number, 2)) + Number(parseInt("1", 2))).toString(2)  // realiza uma soma +1 no numero binario     

                number = parseInt(number, 2).toString(16).toLocaleUpperCase().split("") // transforma numero em hexadecimal e separa em array

                resolve([number[0], number[1], number[2], number[3]])

            }

        })

    }

    static async CalculateAmbientValue(rlTrigger, timeouts = { waitStabilize: 5000, waitTurnOff: 1000 }) {

        DAQ.ligaRele(rlTrigger)

        const setResult = await CappoEcil.setInput(true)
        if (!setResult.success) { return { success: false, msg: `Falha na transmissão de dados com o Cappo Ecil.` } }

        await GeneralCompose.Delay(timeouts.waitStabilize)

        const inputValue = await CappoEcil.ReadInput()
        console.log(inputValue)
        if (!inputValue.success) { return { success: false, msg: `Falha na transmissão de dados com o Cappo Ecil.` } }

        const ambient = (parseInt(inputValue.response.substring(8, 12), 16)) / 10

        DAQ.desligaRele(rlTrigger)
        GeneralCompose.Delay(timeouts.waitTurnOff)
        return { success: true, ambient: ambient }

    }

    static {
        window.CappoEcil = CappoEcil
    }

}