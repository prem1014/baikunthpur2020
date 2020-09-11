import React, { useState, useEffect } from 'react';

import axios from 'axios';

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
    const defaultValue = 'अपने पंचायत का नाम चुनें';
    const title = '99 बैकुंठपुर विधानसभा';
    const [isPanchayat, setIsPanchayat] = useState(false);
    const [village, setVillage] = useState('');
    let vote: any = {
        rjd: [],
        jdu: [],
        bjp: [],
        oth: [],
        total: 0
    }

    const [voteShare, setVoteShare] = useState(vote);
    const [votes, setVotes] = useState(vote);

    const inputChange = (e: any) => {
        setIsPanchayat(e.target.value !== defaultValue ? true: false);
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
        if(localStorage.getItem('id')) {
            alert('आपके मोबाइल या कंप्यूटर से एक बार वोट हो चूका है। कृपया दूसरे मोबाइल या कंप्यूटर से कोसिस करें। ')
            return;
        }
        const obj = {
            name: 'unknown',
            status: true,
            village: village
        }

        let voteShareCopy = { ...votes };
        voteShareCopy[party].push(obj);
        voteShareCopy.total = voteShareCopy.rjd.length + voteShareCopy.bjp.length + voteShareCopy.jdu.length + voteShareCopy.oth.length
        setVotes(voteShareCopy);
        axios.post('https://nrf-api.herokuapp.com/api/mla', {feedback: {...voteShareCopy, _id: party}})
        .then( res => {
            alert(res.data.message);
            getVoteFromDB();
            localStorage.setItem('id',  '' + new Date().getTime());
        })
        .catch( err => {

        })
    }

    const getVotePer = (vote: number, total: number) => {
        if(total === 0) return total;


        return (((vote/total) * 100)).toFixed(1) + '%'
    }

    const getVoteFromDB = () => {
        axios.get('https://nrf-api.herokuapp.com/api/mla')
        .then( res => {
            console.log(res.data);
            const rjd = res.data.result.filter( (it: any) => it._id === 'rjd')
            const jdu = res.data.result.filter( (it: any) => it._id === 'jdu')
            const bjp = res.data.result.filter( (it: any) => it._id === 'bjp')
            const oth = res.data.result.filter( (it: any) => it._id === 'oth')
            const voteData = {
                rjd: rjd[0].rjd,
                jdu: jdu[0].jdu,
                bjp: bjp[0].bjp,
                oth: oth[0].oth,
                total: 0
            }
            voteData.total = voteData.rjd.length + voteData.jdu.length + voteData.bjp.length + voteData.oth.length;
            setVoteShare(voteData);
        })
        .catch( err => {

        })
    }

    useEffect( () => {
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
                     <h3 className="text-center">Total Vote {voteShare.total} </h3>
                    <div className="row">
                        <div className="col-lg-3 col-md-3 col-6" style={{marginBottom: '10px'}}>
                            <div style={container} onClick={(event) => submit('rjd')}>
                                <h5 className="center"><img src={rjd} style={rjdtyle} /></h5>
                                <h5 className="text-center">प्रेम शंकर यादव</h5>
                                <h2>{voteShare.rjd.length}</h2>
                                <h3>{getVotePer(voteShare.rjd.length, voteShare.total)}</h3>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-3 col-6" style={{marginBottom: '10px'}}>
                        <div style={container} onClick={(event) => submit('jdu')}>
                                <h5 className="center"><img src={jdu} style={rjdtyle} /></h5>
                                <h5 className="text-center">मंजीत सिंह</h5>
                                <h2>{voteShare.jdu.length}</h2>
                                <h3>{getVotePer(voteShare.jdu.length, voteShare.total)}</h3>
                            </div>
                            </div>
                        <div className="col-lg-3 col-md-3 col-6">
                        <div style={container} onClick={(event) => submit('bjp')}>
                                <h5 className="center"><img src={bjp} style={rjdtyle} /></h5>
                                <h5 className="text-center">मिथलेश तिवारी</h5>
                                <h2>{voteShare.bjp.length}</h2>
                                <h3>{getVotePer(voteShare.bjp.length, voteShare.total)}</h3>
                            </div>
                            </div>
                        <div className="col-lg-3 col-md-3 col-6">
                        <div style={container} onClick={(event) => submit('oth')}>
                                <h5 className="center"><img src={oth} style={rjdtyle} /></h5>
                                <h5 className="text-center">कोई और</h5>
                                <h2>{voteShare.oth.length}</h2>
                                <h3>{getVotePer(voteShare.oth.length, voteShare.total)}</h3>
                            </div>
                            </div>
                    </div>
                </>
            }
        </>
    )
}


export default Home;