const MenuItems=document.querySelectorAll('.chat-sidebar-menu li');
const cntMessages=document.querySelector('.content-messages-list');
const contentSidebarTitle=document.querySelector('.content-sidebar-title');
const baseUrl='http://localhost:4000';

document.addEventListener('DOMContentLoaded',async function(e){
    MenuItems.forEach((item)=>{
        item.addEventListener('click',async function(e){
            e.preventDefault();
            const previousActiveItem=document.querySelector('.chat-sidebar-menu li.active');
            // Remove 'active' class from previously active item
            if(previousActiveItem){
                previousActiveItem.classList.remove('active');
            }
            //it will add active when we click
            item.classList.add('active');
            //change the text content of the content -sidevartitle based on the clicked item
            contentSidebarTitle.textContent=item.children[0].dataset.title;

            if(item.dataset.title!==undefined){
                contentSidebarTitle.textContent=item.dataset.title;
            }
            if(item.classList.contains('active')){
                if(item.children[0].dataset.title==='chat'){
                    await getAllchats();
                }else if(item.children[0].dataset.title==='Contacts'){
                    await getAllContacts();
                }else if(item.children[0].dataset.title==='Groups'){
                    await getAllGroups();
                }else if(item.children[0].dataset.title==='Settings'){
                    await getAllSettings();
                }else if(item.children[0].dataset.title==='Profile'){
                    await getprofile();
                }
            }
        })
    })
})

async function getAllchats(){
    console.log("Getting all chats");
}
async function getAllGroups(){
    console.log("Getting all Groups");
}
async function getAllSettings(){
    console.log("Getting all Settings");
}
async function getprofile(){
    console.log("Getting all Profile");
}

async function getAllContacts(){
    const token =localStorage.getItem('token');
    cntMessages.innerHTML="";
    try{
        const response=await axios.get(`${baseUrl}/user/contacts`,{
            headers:{Authorization:token},
        })
        const contactUser =response.data.data
        console.log(contactUser)
            createContact(contactUser);
        console.log("data",document.querySelectorAll('[data-conversation]'));
        document.querySelectorAll('[data-conversation]').forEach(function(item){
            item.addEventListener('click', async function(e){
                e.preventDefault();
                console.log("opened chat");
                document.querySelectorAll('.conservation').forEach(function(i){
                    i.classList.remove('active');
                })
                document
                .querySelector(this.dataset.conservation)
                .classList.add('active');
                await generationChat(this.id);
            })
        })
    }catch(err){
        console.log(err)
    }
}
function createContact(data){
    console.log(data)
    const li=document.createElement('li');
    const a=document.createElement('a');
    const img=document.createElement('img');
    const info=document.createElement('span');
    const nameSpan=document.createElement('span');
    const textSpan=document.createElement('span');
    const more = document.createElement('span');

    a.href='#';
    a.id=`${data.id}`
    a.setAttribute("data-conservation",'#conservation-1') //set the data-conservation attribute
    img.classList.add('contact-message-image');
    img.src="https://i.pinimg.com/236x/fd/14/a4/fd14a484f8e558209f0c2a94bc36b855.jpg"
    img.alt=`data.username`;
    nameSpan.className='contact-message-name';
    nameSpan.textContent=`${data.username}`;
    textSpan.className='contact-message-text';
    textSpan.textContent='No Calls Direct Msgs';

    a.appendChild(img);
    a.appendChild(info);
    info.appendChild(nameSpan);
    info.appendChild(textSpan);
    a.appendChild(more);
    li.appendChild(a);
    cntMessages.appendChild(li);
}

async function generationChat(id){
    console.log(id);
    const container=document.querySelector('.conservation-user');
    container.innerHTML="";
    const token=localStorage.getItem('token');
    try{
        const response=await axios.get(`${baseUrl}/user/getchat/${id}`,{
            headers:{Authorization:token},
        })
        const userData=response.data.user;
        localStorage.setItem("currentUser",userData.id);

        const img=document.createElement('img');
        const divWrapper=document.createElement('div');
        const divName=document.createElement('div');
        const divStatus=document.createElement('div');
        img.classList.add('consersation-user-image');
        img.src='https://i.pinimg.com/236x/fd/14/a4/fd14a484f8e558209f0c2a94bc36b855.jpg';
        img.alt='';
        divWrapper.classList.add('conservation-user-details');
        divName.textContent=`${userData.username}`;
        divStatus.classList.add('conservation-user-status','online');
        divStatus.textContent="online";

        //append element to structure
        divWrapper.appendChild(divName);
        divWrapper.appendChild(divStatus);

        //Append the newly Created structed to the container
        container.appendChild(img);
        container.appendChild(divWrapper);

        //main
        const containerMain=document.querySelector('.conservation-main');

        //create the ul element 
        const ul=document.createElement('ul');
        ul.className = 'conservation-wrapper';

        // Create multiple <li> elements and append them to the <ul>
        for(let i=0; i<numberOfItem; i++){
            // Replace 'numberOfItems' with the desired number of <li> elements
            const li=document.createElement('li');
            ul.appendChild(li);
        }
        //append the ul to the container
        container.appendChild(ul);
        container.appendChild(containerMain);
    }catch(e){
        console.log(err);
    }
}
const button=document.getElementById('submit-button');
button.addEventListener('click',sendChat);
async function sendChat(){
    const box=document.getElementById('chat-box');
    console.log(box.value);
    box.value='';
}
