const formatParams = (params) => {
  let separatedParams = Object.entries(params)
  let paramsString = ''
  for (let i = 0; i < separatedParams.length; i++) {
    paramsString += separatedParams[i].join('=')
    if (i !== separatedParams.length - 1) {
      paramsString += "&"
    }
  }
  return paramsString
}

export default formatParams