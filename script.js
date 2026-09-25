const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let xp=0,selectedPart=null,assemblyStep=0,disStep=0,quizIndex=0,quizScore=0;
const components={
Motherboard:{icon:"🟩",desc:"The main circuit board. It connects the CPU, RAM, storage, expansion cards, and other hardware.",place:"Inside the PC case",tip:"Check the case standoffs and rear I/O alignment before securing it."},
CPU:{icon:"🧠",desc:"The central processing unit executes instructions and performs calculations.",place:"CPU socket on the motherboard",tip:"Match the CPU marker with the socket marker. Never force it."},
RAM:{icon:"💾",desc:"Random Access Memory temporarily holds data and programs currently in use.",place:"DIMM slots beside the CPU",tip:"Align the notch before pressing the module into the slot."},
GPU:{icon:"🎮",desc:"The graphics processing unit handles graphics and visual workloads.",place:"Usually the PCIe x16 slot",tip:"Seat the card evenly and secure its bracket."},
Storage:{icon:"💿",desc:"Storage keeps the operating system, applications, and files.",place:"M.2 slot or drive bay",tip:"Secure the drive and connect required cables for the drive type."},
PSU:{icon:"⚡",desc:"The power supply unit converts and distributes electrical power to the computer.",place:"PSU bay in the case",tip:"Use the correct power connectors and route cables safely."},
Cooler:{icon:"❄️",desc:"The CPU cooler removes heat from the processor.",place:"Directly over the CPU",tip:"Use the correct mounting hardware and thermal interface material."},
Case:{icon:"🖥️",desc:"The case protects the components and provides mounting points and airflow.",place:"The enclosure around the system",tip:"Plan airflow and cable routing before closing the case."}
};
const order=["Motherboard","CPU","RAM","Storage","Cooler","GPU","PSU"];
const disOrder=["GPU","PSU","Storage","Cooler","RAM","CPU","Motherboard"];
const quiz=[
["Which component is the main circuit board?",["CPU","Motherboard","PSU","RAM"],1],
["Which component provides temporary working memory?",["Storage","GPU","RAM","Case"],2],
["Where is a typical discrete GPU installed?",["DIMM slot","CPU socket","PCIe x16 slot","PSU bay"],2],
["What is the PSU's main job?",["Cooling","Power delivery","File storage","Graphics processing"],1],
["What does storage primarily provide?",["Long-term data storage","CPU calculations","Power conversion","Cooling"],0],
["Why is a CPU cooler needed?",["To store files","To remove CPU heat","To add RAM","To power the PC"],1],
["Before working on real hardware, what should you do?",["Keep it powered","Unplug and power it off","Add water","Touch all contacts"],1],
["Why do compatibility checks matter?",["Parts must physically/electrically work together","Only for appearance","To increase volume","They are unnecessary"],0]
];

function addXP(n){xp=Math.max(0,xp+n);$("#xp").textContent=xp}
function nav(id){$$(".page").forEach(p=>p.classList.toggle("hidden",p.id!==id));$$(".tab").forEach(b=>b.classList.toggle("active",b.dataset.page===id));if(id==="assembly")renderAssembly();if(id==="disassembly")renderDisassembly();if(id==="quiz")renderQuiz()}
$$(".tab").forEach(b=>b.addEventListener("click",()=>nav(b.dataset.page)));

function renderComponents(){
 $("#components").innerHTML=Object.entries(components).map(([name,c])=>`<button class="component" data-component="${name}"><div class="icon">${c.icon}</div><h3>${name}</h3><p>${c.desc}</p></button>`).join("");
 $$(".component").forEach(b=>b.addEventListener("click",()=>openModal(b.dataset.component)));
}
function openModal(name){const c=components[name];$("#modalContent").innerHTML=`<div class="badge">COMPONENT GUIDE</div><h2>${c.icon} ${name}</h2><p>${c.desc}</p><ul><li><b>Location:</b> ${c.place}</li><li><b>Technician tip:</b> ${c.tip}</li></ul>`;$("#modal").classList.remove("hidden")}
$("#closeModal").addEventListener("click",()=>$("#modal").classList.add("hidden"));
$("#modal").addEventListener("click",e=>{if(e.target.id==="modal")$("#modal").classList.add("hidden")});

function renderAssembly(){
 $("#partsTray").innerHTML=Object.keys(components).filter(x=>x!=="Case").map(p=>`<button class="part ${assemblyStep>order.indexOf(p)?"done":""} ${selectedPart===p?"selected":""}" data-part="${p}">${components[p].icon} ${p}</button>`).join("");
 $$(".part").forEach(b=>b.addEventListener("click",()=>{selectedPart=b.dataset.part;renderAssembly()}));
 $("#assemblyProgress").style.width=Math.min(100,assemblyStep/order.length*100)+"%";
 $("#assemblyMessage").textContent=assemblyStep<order.length?`Step ${assemblyStep+1}: Install ${order[assemblyStep]}.`:"🎉 Assembly complete! Great work, Technician!";
 $$(".slot").forEach(s=>s.onclick=()=>placePart(s.dataset.slot,s));
}
function placePart(slot,el){
 if(assemblyStep>=order.length)return;
 const needed=order[assemblyStep];
 if(selectedPart===needed && slot===needed){
   el.classList.add("installed");assemblyStep++;addXP(50);selectedPart=null;
   renderAssembly();
 }else{
   addXP(-10);$("#assemblyMessage").textContent=`Not quite. The next required component is ${needed}. Check the tray and try again. (-10 XP)`;
 }
}
$("#resetAssembly").addEventListener("click",()=>{assemblyStep=0;selectedPart=null;$$(".slot").forEach(x=>x.classList.remove("installed"));renderAssembly()});

function renderDisassembly(){
 $("#disassemblyList").innerHTML=disOrder.map((p,i)=>`<div class="info" style="padding:11px;border-bottom:1px solid #edf0f4"><b>${i<disStep?"✓":i===disStep?"→":"○"} ${p}</b> — ${i<disStep?"Removed":i===disStep?"Current task":"Locked"}</div>`).join("");
}
$("#removePart").addEventListener("click",()=>{if(disStep<disOrder.length){disStep++;addXP(40);$("#disMessage").textContent=disStep<disOrder.length?`Correct! Next: remove ${disOrder[disStep]}. (+40 XP)`:"🎉 Disassembly complete! You followed the sequence safely." ;renderDisassembly()}});
$("#resetDisassembly").addEventListener("click",()=>{disStep=0;$("#disMessage").textContent="Task 1: Remove the GPU first.";renderDisassembly()});

function renderQuiz(){
 if(quizIndex>=quiz.length){
  $("#quizQuestion").textContent=`Quiz Complete! ${quizScore}/${quiz.length}`;
  $("#quizChoices").innerHTML=`<p>You earned ${quizScore*25} XP from the quiz.</p><button class="btn primary" id="retry">Try Again</button>`;
  $("#quizFeedback").textContent="";$("#nextQuestion").classList.add("hidden");
  $("#retry").onclick=()=>{quizIndex=0;quizScore=0;renderQuiz()};return;
 }
 const q=quiz[quizIndex];$("#quizQuestion").textContent=`${quizIndex+1}. ${q[0]}`;
 $("#quizChoices").innerHTML=q[1].map((x,i)=>`<button class="choice" data-i="${i}">${x}</button>`).join("");
 $("#quizFeedback").textContent="";$("#nextQuestion").classList.add("hidden");
 $$(".choice").forEach(b=>b.onclick=()=>answerQuiz(Number(b.dataset.i)));
}
function answerQuiz(i){
 const q=quiz[quizIndex],buttons=$$(".choice");buttons.forEach(b=>b.disabled=true);
 if(i===q[2]){buttons[i].classList.add("correct");$("#quizFeedback").textContent="Correct! +25 XP";quizScore++;addXP(25)}
 else{buttons[i].classList.add("wrong");buttons[q[2]].classList.add("correct");$("#quizFeedback").textContent="Not quite. The highlighted answer is correct."}
 $("#nextQuestion").classList.remove("hidden");
}
$("#nextQuestion").onclick=()=>{quizIndex++;renderQuiz()};

$("#startChallenge").onclick=()=>{assemblyStep=0;selectedPart=null;nav("assembly");$("#assemblyMessage").textContent="🏆 Challenge started! Build the PC without mistakes."};

renderComponents();renderAssembly();renderDisassembly();renderQuiz();