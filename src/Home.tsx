import React, { useState, useEffect } from 'react';

import axios from 'axios';
import libphonenumber from 'google-libphonenumber';

import listOfPanchayat from './PanchayatList';

import rjd from './assets/rjd.png';
import jdu from './assets/jdu.jpg';
import bjp from './assets/bjp.png';
import oth from './assets/oth.jpg';

interface IVote {
    rjd: Array<any>;
    jdu: Array<any>;
    bjp: Array<any>;
    oth: Array<any>;
    total: number
}

const Home = () => {
    const urlProd = 'https://nrf-api.herokuapp.com/api/mla';
    const urlLocal = 'http://localhost:9000/api/mla';
    const emailUrlProd = 'https://hms-rest-api.herokuapp.com/api/send-otp';
    const emailUrlLocal = 'http://localhost:8080/api/send-otp';
    const defaultValue = 'अपने पंचायत का नाम चुनें';
    const title = '99 बैकुंठपुर विधानसभा';
    const [isPanchayat, setIsPanchayat] = useState(false);
    const [village, setVillage] = useState('');
    const [userName, setUserName] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [email, setEmail] = useState('');
    const [party, setParty] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [btnDisable, setBtnDisable] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [validOtp, setValidOtp] = useState(false);
    let vote: any = {
        rjd: [],
        jdu: [],
        bjp: [],
        oth: [],
        total: 0
    }

    const [voteShare, setVoteShare] = useState(vote);
    const [votes, setVotes] = useState(vote);
    const [items, setItems] = useState(vote);

    const inputChange = (e: any) => {
        setIsPanchayat(e.target.value !== defaultValue ? true : false);
        setVillage(e.target.value);
    }

    const rjdtyle = {
        height: '70px',
        borderRadius: '62px',
        width: '70px'
    }
    const container = {
        padding: '10px',
        boxShadow: '0 3px 10px grey',
        cursor: 'pointer'
    }

    const submit = (party: string) => {
        const voteExpireTime = new Date('Thu Sep 18 2020 23:59:59 GMT+0530 (India Standard Time)').getTime();
        const todayTime = new Date().getTime();
        if(todayTime > voteExpireTime) {
            alert('मतदान अब समाप्त हो गया है। आप सभी को बहुत-बहुत धन्यवाद');
            return;
        }
        if (userName.length <= 5) {
            alert('अपना सही नाम दीजिये। ');
            return;
        }
        if (!mobileNo) {
            alert('मोबाइल नंबर दीजिये');
            return;
        }
        if (!isValidMobile(mobileNo)) {
            alert('मोबाइल नंबर वैध नहीं है। ');
            return;
        }
        // alert('Heavy load on server, please try after some time');
        // return
        if (document.cookie || localStorage.getItem('id')) {
            alert('आपके मोबाइल या कंप्यूटर से एक बार वोट हो चूका है। कृपया दूसरे मोबाइल या कंप्यूटर से कोसिस करें। ')
            return;
        }
        const obj = {
            status: true,
            village: village,
            name: userName,
            mobile: mobileNo
        }

        let voteShareCopy = { ...votes };
        voteShareCopy[party].push(obj);
        voteShareCopy.total = voteShareCopy.rjd.length + voteShareCopy.bjp.length + voteShareCopy.jdu.length + voteShareCopy.oth.length
        setVotes(voteShareCopy);
        setBtnDisable(true);
        axios.post(urlProd, { feedback: { ...voteShareCopy, _id: party } })
            .then(res => {
                alert(res.data.message);
                getVoteFromDB();
                localStorage.setItem('id', '' + new Date().getTime());
                document.cookie = '' + new Date().getTime();
                onclose();
            })
            .catch(err => {
                setBtnDisable(false)
            })
    }

    const getVotePer = (vote: number, total: number) => {
        if (total === 0) return total;


        return (((vote / total) * 100)).toFixed(1) + '%'
    }

    const getVoteFromDB = () => {
        axios.get(urlProd)
            .then(res => {
                // const rjd = res.data.result.filter((it: any) => it._id === 'rjd')
                // const jdu = res.data.result.filter((it: any) => it._id === 'jdu')
                // const bjp = res.data.result.filter((it: any) => it._id === 'bjp')
                // const oth = res.data.result.filter((it: any) => it._id === 'oth')
                const voteData = {
                    rjd: res.data.result.rjd,
                    jdu: res.data.result.jdu,
                    bjp: res.data.result.bjp,
                    oth: res.data.result.oth,
                    total: 0
                }
                voteData.total = voteData.rjd + voteData.jdu + voteData.bjp + voteData.oth;
                setItems(res.data.item);
                setVoteShare(voteData);
            })
            .catch(err => {

            })
    }

    const getVoteByVillage = (id: any, party: any) => {
        const total = items[party].filter((itm: any) => itm.village === id);

        return total.length;
    }

    const getVillageById = (id: string) => {
        const villageDetails: any = listOfPanchayat.find((vill: any) => vill.id === id);
        return villageDetails.hn
    }

    const inputHndl = (e: any, type: string) => {
        if (type === 'name') {
            setUserName(e.target.value);
        } else if (type === 'mobile') {
            setMobileNo(e.target.value);
        } else if (type === 'email') {
            setEmail(e.target.value);
        } else if (type === 'otp') {
            setOtp(e.target.value);
        }
    }

    const isValidMobile = (mobileNo: string) => {
        const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
        const isValid = phoneUtil.isValidNumberForRegion(phoneUtil.parse(mobileNo, 'IN'), 'IN');

        return isValid;
    }

    const openModal = (party: string) => {
        setParty(party);
        setIsOpen(true)
    }

    const onclose = () => {
        setIsOpen(false);
        setParty('');
        setVotes(vote);
        setBtnDisable(false)
    }
    
    const getOtp = () => {
        axios.post(emailUrlProd, {email: email})
        .then( res => {
            if(res.data.successCode === '200') {
                alert(res.data.message);
                setOtpSent(true);
            }
        })
        .catch(err => {
            console.log(err);
        })
    }

    const validateOtp = () => {
        axios.get(emailUrlProd + '/' + otp)
        .then( res => {
            if(res.data.successCode === 'OTP_VALID') {
                setValidOtp(true);
            }
            alert(res.data.message);
        })
        .catch( err => {
            console.log(err);
        })
    }

    useEffect(() => {
        getVoteFromDB();
    }, [])

    return (
        <>
            <h4>{title}</h4>
            <hr />
            <h5>बैकुंठपुर विधानसभा महासर्वे 2020</h5>
            <h6>महासर्वे में भाग लेने के लिए अपने पंचायत का नाम चुनें</h6>
            <hr />
            <div className="row">
                <div className="col-3"></div>
                <div className="col-lg-6 col-md-6 col-12">

                    <select className="form-control" onChange={(event) => inputChange(event)}>
                        <option>{defaultValue}</option>
                        {
                            listOfPanchayat.map((item) => (
                                <option value={item.id}>{item.name} - {item.hn}</option>
                            ))
                        }
                    </select>

                </div>
                <div className="col-3"></div>
            </div>
            {
                isPanchayat &&
                <>
                    <hr />
                    <h3 className="text-center">Total Vote {voteShare.total}</h3>
                    <div className="row">
                        <div className="col-lg-3 col-md-3 col-6" style={{ marginBottom: '10px' }}>
                            <div style={container} onClick={(event) => openModal('rjd')}>
                                <h5 className="center"><img src={rjd} style={rjdtyle} /></h5>
                                <h5 className="text-center">प्रेम शंकर यादव</h5>
                                <h2>{voteShare.rjd}</h2>
                                <h3>{getVotePer(voteShare.rjd, voteShare.total)}</h3>
                                {/* <h6>{getVillageById(village)} {getVoteByVillage(village, 'rjd')}</h6> */}
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-3 col-6" style={{ marginBottom: '10px' }}>
                            <div style={container} onClick={(event) => openModal('jdu')}>
                                <h5 className="center"><img src={jdu} style={rjdtyle} /></h5>
                                <h5 className="text-center">मंजीत सिंह</h5>
                                <h2>{voteShare.jdu}</h2>
                                <h3>{getVotePer(voteShare.jdu, voteShare.total)}</h3>
                                {/* <h6>{getVillageById(village)} {getVoteByVillage(village, 'jdu')}</h6> */}
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-3 col-6">
                            <div style={container} onClick={(event) => openModal('bjp')}>
                                <h5 className="center"><img src={bjp} style={rjdtyle} /></h5>
                                <h5 className="text-center">मिथलेश तिवारी</h5>
                                <h2>{voteShare.bjp}</h2>
                                <h3>{getVotePer(voteShare.bjp, voteShare.total)}</h3>
                                {/* <h6>{getVillageById(village)} {getVoteByVillage(village, 'bjp')}</h6> */}

                            </div>
                        </div>
                        <div className="col-lg-3 col-md-3 col-6">
                            <div style={container} onClick={(event) => openModal('oth')}>
                                <h5 className="center"><img src={oth} style={rjdtyle} /></h5>
                                <h5 className="text-center">कोई और</h5>
                                <h2>{voteShare.oth}</h2>
                                <h3>{getVotePer(voteShare.oth, voteShare.total)}</h3>
                                {/* <h6>{getVillageById(village)} {getVoteByVillage(village, 'oth')}</h6> */}
                            </div>
                        </div>
                    </div>
                </>
            }
            {
                isOpen &&
                <div id="myModal" className="cus-modal">
                    <div className="cus-modal-content">
                        <span className="close" onClick={() => onclose()}>&times;</span>
                        <div className="row" style={{ marginTop: '40px' }}>
                            <div className="col-12">
                                <input type="text"
                                    value={userName}
                                    placeholder="अपना नाम डालिये।"
                                    onChange={(e) => inputHndl(e, 'name')}
                                    className="form-control"
                                />
                            </div>
                            <div className="col-12" style={{ marginTop: '10px' }}>
                                <input type="number"
                                    value={mobileNo}
                                    placeholder="मोबाइल नंबर दीजिये।"
                                    onChange={(e) => inputHndl(e, 'mobile')}
                                    className="form-control"
                                />
                            </div>
                            {/* <div className="col-12" style={{ marginTop: '10px' }}>
                                <input type="email"
                                    value={email}
                                    placeholder="अपना ईमेल दीजिये और ओके कीजिये"
                                    onChange={(e) => inputHndl(e, 'email')}
                                    className="form-control"
                                />
                            </div> */}
                            {/* {
                                otpSent &&
                                <div className="col-12" style={{ marginTop: '10px' }}>
                                <input type="number"
                                    value={otp}
                                    placeholder="otp डालिये।"
                                    onChange={(e) => inputHndl(e, 'otp')}
                                    className="form-control"
                                />
                            </div>
                            }
                            {
                                !otp && !otpSent &&
                                <div className="col-12" style={{ marginTop: '10px' }}>
                                    <button disabled={!userName || btnDisable}
                                        onClick={(event) => getOtp()}
                                        className="btn btn-info"
                                    >ओके कीजिये</button>
                                </div>
                            } */}
                            {
                                
                                <div className="col-12" style={{ marginTop: '10px' }}>
                                    <button disabled={!userName || btnDisable}
                                        onClick={(event) => submit(party)}
                                        className="btn btn-info"
                                    >वोट कीजिये</button>
                                </div>
                            }
                            {/* {
                                otpSent && !validOtp &&
                                <div className="col-12" style={{ marginTop: '10px' }}>
                                    <button disabled={!userName || btnDisable}
                                        onClick={(event) => validateOtp()}
                                        className="btn btn-info"
                                    >सत्यापित कीजिये</button>
                                </div>
                            } */}
                        </div>
                    </div>
                </div>
            }
            <div className="row">
                <div className="col-12" style={{ marginTop: '20px' }}>
                    <h6 className="text-center">
                        मतदान 18-09-2020 को पूर्वाह्न 11:59 बजे समाप्त हो गया
                    </h6>
                </div>
            </div>
            <div className="row">
                <div className="col-12" style={{ ...container, marginTop: '20px' }}>
                    <h5><a href="http://premprakash.co.in/">
                        <div>Designed and developed by</div>
                        <div>Prem Prakash</div>
                    </a></h5>

                    <h5><a href="http://www.premprakash.co.in/#/contactMe">
                        <div>Connect with me for all kind of IT or software services</div>
                    </a></h5>
                    <h6 className="text-center">We provide software services for school, hospital, online survey, online advertisements and many more...</h6>
                </div>
            </div>
        </>
    )
}


export default Home;
