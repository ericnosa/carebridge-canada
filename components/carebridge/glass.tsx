'use client';
import {useRef,useEffect,HTMLAttributes} from 'react';
export function GlassSurface({children,className='',interactive=false,...props}:HTMLAttributes<HTMLDivElement>&{interactive?:boolean}){const ref=useRef<HTMLDivElement>(null);useEffect(()=>{const el=ref.current;if(!el||!interactive)return;let frame=0;const move=(e:PointerEvent)=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.effects==='reduced'||e.pointerType!=='mouse')return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const r=el.getBoundingClientRect();el.style.setProperty('--px',`${e.clientX-r.left}px`);el.style.setProperty('--py',`${e.clientY-r.top}px`)})};el.addEventListener('pointermove',move);return()=>{el.removeEventListener('pointermove',move);cancelAnimationFrame(frame)}},[interactive]);return <div ref={ref} className={`glass ${interactive?'glass-interactive':''} ${className}`} {...props}>{children}</div>}
export const GlassCard=GlassSurface;
export const GlassNav=GlassSurface;
export const GlassStatus=GlassSurface;
export const GlassModal=GlassSurface;
