//config
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code

//Unix socket client module for connect to flight-recorder
const { Writer } = require('./unix_socket_client')


const FlightRecorder = {

  //End next
  Final : (req, res) => {
    if (req.mock) return
    try {
      //Gard
      if (res.fr_response?.status_code != code.SUCCESS_ZERO) return //ここで終了

      const required = {
        kind : APPLI_NAME || null,
        logiD: req.logiD || null,
        customer_uuid: req.params?.customer_uuid || null,
      }
      const session = {
        op_access_token: res.oauth?.op_access_token || null,
        op_cust_uid: res.oauth?.op_cust_uid || null,
        op_ope_uid: res.oauth?.op_ope_uid || null,
        op_rid: res.oauth?.op_rid || null,
        op_session: res.oauth?.op_session || null,
        op_system: res.oauth?.op_system || null,
        rid: res.oauth?.rid || null,
        token: res.oauth?.token || null,
        uid: res.oauth?.uid || null,
      }
      const common = {
        type: 'INFO',
        service: 'hmt',
        component: COMPONENT_NAME || null,
        api: req.api,
        logiD: req.logiD,
        use: req.ns.split('-')[2],
        client: req.valid_client,
        session_id: session?.token || null,
        customer_uuid: req.params?.customer_uuid || null,
        hmt_id: session?.op_session || null,
        uuid: null,
      }
      const request = { //log formatが変わってしまう点に注意=文字列(JSON化)で送る
        headers: JSON.stringify(req.headers),
        body: JSON.stringify(req.params),
      }
      const response = { //log formatが変わってしまう点に注意=文字列(JSON化)で送る
        headers: JSON.stringify(res.fr_headers),
        body: JSON.stringify(res.fr_response),
        responded: JSON.stringify(res.fr_responded),
      }
      const data = [{ 
        ...required,
        common,
        session,
        request,
        response }]
      //Send data
      const socket = new Writer()
      socket.write(JSON.stringify(data))
      //console.log(data)
    } catch(err) {
      console.error(err)
    }
  },
  
  //Session recording
  Session : (req, res, next) => {
    if (req.mock) return
    try {
      //Gard oauth
      if (res.oauth?.status_code >= 200) {
        return //ここで終了
      }
      //Set session recording data
      const data = [{
        headers : req.headers,
        logiD: req.logiD,
        api: req.api,
        kind : 'Session',
        client: req.client,
        ns: req.ns,
        session_id: res.oauth?.token || null,
        customer_uuid: req.params?.customer_uuid || null,
      }]
      //Send data
      const socket = new Writer()
      socket.write(JSON.stringify(data))
      next()
    } catch(err) {
      console.error(err)
    }
  },

  //Someone recording
  Someone : (req, res) => {
    if (req.mock) return
    try {
      console.log()
    } catch(err) {
      console.error(err)
    }
  }
}

module.exports = {
  FlightRecorder,
}

