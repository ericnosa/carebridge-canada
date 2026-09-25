'use client';
import {createContext,useContext,useState,ReactNode} from 'react';
type Event={action:string;time:string};
type Demo={appointment:string;setAppointment:(s:string)=>void;events:Event[];log:(s:string)=>void;read:boolean;setRead:(b:boolean)=>void;reply:boolean;setReply:(b:boolean)=>void;requested:string[];request:(s:string)=>void;consents:Record<string,boolean>;toggleConsent:(s:string)=>void};
const Context=createContext<Demo|null>(null);
export function DemoProvider({children}:{children:ReactNode}){
 const [appointment,setAppointment]=useState('Friday, October 2 · 10:30 AM');
 const [events,setEvents]=useState<Event[]>([]);
 const [read,setRead]=useState(false);
 const [reply,setReply]=useState(false);
 const [requested,setRequested]=useState<string[]>([]);
 const [consents,setConsents]=useState<Record<string,boolean>>({'Care coordination':true,'Share with care team':true,'Optional AI assistance':false});
 function log(action:string){setEvents(e=>[{action,time:new Date().toLocaleTimeString('en-CA')},...e].slice(0,30))}
 function request(s:string){setRequested(a=>a.includes(s)?a:[...a,s]);log('Demo connector request: '+s)}
 function toggleConsent(s:string){setConsents(a=>({...a,[s]:!a[s]}));log('Demo consent changed: '+s)}
 return <Context.Provider value={{appointment,setAppointment,events,log,read,setRead,reply,setReply,requested,request,consents,toggleConsent}}>{children}</Context.Provider>
}
export function useDemo(){const c=useContext(Context);if(!c)throw Error('DemoProvider required');return c}
