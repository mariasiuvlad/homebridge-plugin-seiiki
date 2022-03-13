const responseExample =
  "ret=OK,pow=0,mode=3,adv=,stemp=23.0,shum=0,dt1=25.0,dt2=M,dt3=23.0,dt4=25.0,dt5=25.0,dt7=25.0,dh1=AUTO,dh2=50,dh3=0,dh4=0,dh5=0,dh7=AUTO,dhh=50,b_mode=3,b_stemp=23.0,b_shum=0,alert=255,f_rate=3,f_dir=0,b_f_rate=3,b_f_dir=0,dfr1=5,dfr2=5,dfr3=3,dfr4=5,dfr5=5,dfr6=5,dfr7=5,dfrh=5,dfd1=0,dfd2=0,dfd3=0,dfd4=0,dfd5=0,dfd6=0,dfd7=0,dfdh=0"

const parseResponse = (response) => {
  const ok = /stemp=\d{1,2}/.exec(response)
  if (ok) {
    return ok[0].split("=")[1]
  } else {
    return false
  }
}

parseResponse(responseExample)
