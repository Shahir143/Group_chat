const baseUrl='http://localhost:4000';
const token=localStorage.getItem('token');

const container=document.querySelector('.content-messages-list');
const contentmessageContainer=document.getElementsByClassName('group-add');
const groupAdd=document.getElementById('groupAddDiv');
const modelOpen=document.getElementById('add-group-link');
const subtButton=document.getElementById('submit-button');
const conservation=document.querySelectorAll('.conversation');


let profile_picture;
const profileDropdown = document.getElementById("profileDropdown");

profileDropdown.addEventListener("click", (e) => {
    e.preventDefault();
    const target = e.target;

    if (target.matches("#logout")) {
        const logout = confirm("Are you sure you want to logout?");
        if (logout) {
            localStorage.clear();
            window.location.href = '../html/main.html';
        }
    }else if(target.matches('#profile')){
        console.log('profile');
    }

});


document.addEventListener('DOMContentLoaded',async function(e){
    e.preventDefault();
try{
    const MenuItems=document.querySelectorAll('.chat-sidebar-menu li');
    const contentSidebarTitle=document.querySelector('.content-sidebar-title');

    const groupMessages=localStorage.getItem('GroupMessages');
    const messages=localStorage.getItem('Messages');

        if(groupMessages===null){
            const initialgrpmessages=[];
            localStorage.setItem('GroupMessages',JSON.stringify(initialgrpmessages));
        }
        if(messages===null){
            const initialMessages=[];
            localStorage.setItem('Messages',JSON.stringify(initialMessages));
        }

    MenuItems.forEach((item)=>{
        item.addEventListener('click',async function(e){
            e.preventDefault();
            const previousActiveItem=document.querySelector('.chat-sidebar-menu li.active');
            
            if(previousActiveItem){
                previousActiveItem.classList.remove('active');
            }
            
            item.classList.add('active');
            //change the text content of the content -sidevartitle based on the clicked item
            contentSidebarTitle.textContent=item.children[0].dataset.title|| item.dataset.title;

            if(item.classList.contains('active')){
                //handle more through switch 
                switch(contentSidebarTitle.textContent){
                    case'Chats':
                        await getAllchats();
                        break;
                    case'Add-Friends':
                        await getAllUser();
                        break;
                    case'Groups':
                        await getAllGroups();
                        break;
                    case'Friends':
                        await getAllFriends();
                        break;
                    case'Requests':
                        await getRequests();
                        break;
                    case'Settings':
                        await getAllSettings();
                        break;
                    case'Profile':
                        await getprofile();
                        break;
                    default:
                        break;
                }
            }
        })
    })
}catch (err){
    console.log(err);
    }
})


async function getAllchats(){
    try{
        await getAllFriends();

        // Add click event listeners to chat heads
        document.querySelectorAll("[data-conversation]").forEach(function (item) {
            item.addEventListener("click", async function (e) {
                e.preventDefault();
                const chatId = item.id;

                // Remove 'active' class from all conversations
                document.querySelectorAll(".conversation").forEach(function (i) {
                    i.classList.remove("active");
                });

                console.log(document.querySelector(".conversation"))
                // Show the selected conversation
                document.querySelector("#conversation-1").classList.add("active");

                // Set the chat as active
                localStorage.setItem("chatActive", "user");

                // Generate the chat for the selected friend (assuming you have a function named generateChat)
                generationChat(chatId)
                
            })
        })
    }catch(err){
        console.log("Error getting all chat",err)
    }
}

async function getRequests(){
    groupAdd.classList.remove('active');
    container.innerHTML="";
    const response= await axios.get(`${baseUrl}/user/getRequests`,{
        headers:{
            Authorization:token,
        }
    })
    if(response.status===200){
        const request =response.data.data;
        for(const contact of request){
            createContact(contact);
        }
        document.querySelectorAll("[data-conversation]").forEach(function (item) {
            item.addEventListener("click", async function (e) {
              e.preventDefault();
                console.log("opened chat");
                const confirmation =confirm('You need to add in friendList?');
                const request={
                    confirmation:confirmation,
                    contactId:item.id
                }
                const response=await axios.post(`${baseUrl}/user/addUser`,request,{
                    headers:{
                        Authorization:token
                    }
                })
            })
        })

    }
}

async function getAllFriends(){
    try{
    groupAdd.classList.remove('active');
    conservation[1].classList.remove('active');
    conservation[0].classList.add('active');

    //clear the container
    container.innerHTML='';

    //fetch the user list from the database

    const response= await axios.get(`${baseUrl}/user/friends`,{
        headers:{
            Authorization:token,
        }
    })
    if(response.status===200){
        const friend=response.data.data;

        const filtersFrds=friend.filter((friend)=>friend.id!==friend.userId)
        
        if(filtersFrds.length===0){
            console.log("you have no friends ")
            return ;
        }
            filtersFrds.forEach((friend)=>{
                createContact(friend)
            })
    }else{
        console.log("error in fetching the friends",response.status)
    }
    }catch(err){
        console.log("Error getting frds",err);
    }
}

async function getAllSettings(){
    try {
		// Clear the container content
		container.innerHTML = "";

		// Remove 'active' class from groupAddDiv
		groupAdd.classList.remove("active");
	} catch (error) {
		console.error("Error in getSettings:", error);
		// Handle errors, display an error message, or take appropriate actions.
	}
}
async function getprofile(){
    try {
		console.log("Getting profile");
        
		// Clear the container content
		container.innerHTML = "";

		// Remove 'active' class from groupAddDiv
		groupAdd.classList.remove("active");
	} catch (error) {
		console.error("Error in getProfile:", error);
		// Handle errors, display an error message, or take appropriate actions.
	}
}

async function getAllUser(){
    container.innerHTML="";
    try{
        const response=await axios.get(`${baseUrl}/user/contacts`,{
            headers:{Authorization:token},
        })
        const contactUser =response.data.data.forEach((contact)=>{
            
            createContact(contact);
        })
        console.log("data",document.querySelectorAll('[data-conversation]'));
        document.querySelectorAll("[data-conversation]").forEach(function (item) {
            item.addEventListener("click", async function (e) {
              e.preventDefault();
                console.log("opened chat");
                const confirmation =confirm('You need to make Friend ?');
                if(confirmation){
                    const contactId=this.id;
                    
                    await addContact(contactId);
                }
                document.querySelectorAll('.conservation').forEach(function(i){
                    i.classList.remove('active');
                })
                document.querySelector("#conversation-1").classList.add("active");
                await generationChat(this.id);
            })
        })
    }catch(err){
        console.log(err)
    }
}
async function addContact(contactId){
    try{
        const details={contactId:contactId};
        const response=await axios.post(`${baseUrl}/user/addContact`,details,{headers:{Authorization:token}})
    }catch(err){
        console.log(err,"error in adding contact");
    }
}
function createContact(data){

    const li=document.createElement('li');
    const a=document.createElement('a');
    const img=document.createElement('img');
    const info=document.createElement('span');
    const nameSpan=document.createElement('h2');
    const textSpan=document.createElement('span');
    const more = document.createElement('span');

    a.href='#';
    a.id=`${data.id}`
    a.setAttribute("data-conversation",'#conservation-1') //set the data-conservation attribute
    img.classList.add('contact-message-image');
    img.src="https://i.pinimg.com/236x/fd/14/a4/fd14a484f8e558209f0c2a94bc36b855.jpg"
    img.alt=`data.username`;
    nameSpan.className='contact-message-name';
    nameSpan.textContent=`${data.username}`;
    textSpan.classList.add('contact-message-text');
    textSpan.textContent=`${data.bio}`;

    a.appendChild(img);
    a.appendChild(info);
    info.appendChild(nameSpan);
    info.appendChild(textSpan);
    a.appendChild(more);
    li.appendChild(a);

    //appending the li to container 
    container.appendChild(li);
}
function crtTime(value) {
    return value < 10 ? `0${value}` : value;
}
async function generateHead(userData){
    try {
        const container = document.querySelector(".conversation-user");

        const img = document.createElement("img");
        const divWrapper = document.createElement("div");
        const divName = document.createElement("div");
        const divStatus = document.createElement("div");

        // set attributes
        img.classList.add('conversation-user-image'); // Fix typo here
        img.src = 'https://i.pinimg.com/236x/fd/14/a4/fd14a484f8e558209f0c2a94bc36b855.jpg';
        img.alt = 'user profile';
        divWrapper.classList.add('conversation-user-details'); // Fix typo here
        divName.textContent = `${userData.username}`;
        divStatus.classList.add('conversation-user-status', `${userData.lastseen}`); // Assuming 'online' is a class
        const lastSeenDate = new Date(userData.lastseen);

        const formattedDate = `${crtTime(lastSeenDate.getHours())}:${crtTime(lastSeenDate.getMinutes())}:${crtTime(lastSeenDate.getSeconds())} ${crtTime(lastSeenDate.getDate())}-${crtTime(lastSeenDate.getMonth() + 1)}-${lastSeenDate.getFullYear()}`;

        divStatus.textContent = formattedDate;

        // Clear any existing content in the container
        container.innerHTML = "";

        // Append elements to build the structure
        divWrapper.appendChild(divName);
        divWrapper.appendChild(divStatus);
        container.appendChild(img);
        container.appendChild(divWrapper); // Append divWrapper only once
        console.log(container);
        updateChatButtons();

    } catch (err) {
        console.log("Error generating header", err);
    }
}

function updateChatButtons(){
    console.log("updateChatButtons");
    const chatActive=localStorage.getItem("chatActive");
    const nrmlChatBtn=document.getElementById("normal-chat-buttons");
    const grpChatBtn=document.getElementById("group-chat-buttons");
    if(chatActive==="user"){
        nrmlChatBtn.style.display="flex";
        grpChatBtn.style.display="none";
    }else if(chatActive==="group"){
        nrmlChatBtn.style.display="none";
        grpChatBtn.style.display="flex";
    }else{
        console.log("error in activting buttons",chatActive)
    }
}

async function generateMain(chat, profile_picture){
    try{
        clearChatMessages();
        for(const item of chat){
            await createmessage(item,profile_picture);

        }
    }catch(err){
        console.log("error in generationMain",err);
    }
}
function clearChatMessages(){
    const chatArea = document.querySelector(".conversation-wrapper");
    chatArea.innerHTML="";
}
async function createmessage(item,profile_picture){
    console.log(item)
    try{
        if(item.isAttachment===true){
            const listItem=document.createElement('li');
            if(item.messageStatus==='received'){
                listItem.classList.add('conservation-item',"me");
            }else{
                listItem.classList.add('conservation-item');
            }
            const sideDiv=document.createElement('div');
            sideDiv.classList.add('conservation-item-image');

            const image=document.createElement('img');
            image.classList.add('conservation-item-image');
            image.src=`${profile_picture}`;
            image.alt="";

            //append the image to the conservation-item-side div
            sideDiv.append(img);

            //create the conservation-item-content div
            const contentDiv=document.createElement('div');
            contentDiv.classList.add('conservation-item*-content');
            

            //create the conservation-item-wrapper div
            const wrapperDiv=document.createElement('div');
            wrapperDiv.classList.add('conservation-item-wrapper');

            //create the conservation-item-box-div
            const boxDiv=document.createElement('div');
            boxDiv.classList.add('conservation-item-box');

            //create the conservation-item-text-div
            const textDiv=document.createElement('div');
            textDiv.classList.add('conservation-item-text');

            //create the paragraph element for the message content 
            const messageparagraph=document.createElement('div');
            messageparagraph.textContent = item.content;
            messageparagraph.href = item.fileLocation;

            //create the conservation-item-time-div
            const timeDiv=document.createElement('div');
            timeDiv.classList.add('conservation-item-time');
            timeDiv.textContent=item.createdAt;

            //Append the message content and timestamp to the conservation-item time and message paragraph
            textDiv.appendChild(messageparagraph);
            textDiv.appendChild(timeDiv);
            
            //create the conservation-item-dropdown-div
            const dropdownDiv=document.createElement('div');
            dropdownDiv.classList.add('conservation-item-dropdown');

            //create the dropdown toggle button
            const toggleButton = document.createElement('button');
            toggleButton.setAttribute('type', 'button');
            toggleButton.classList.add('conservation-item-toggle');
            toggleButton.innerHTML=`<i class='ri-more-2-line></i>`;
            
            //create the dropdown list
            const dropdownList=document.createElement('ul');
            dropdownList.classList.add('conservation-item-dropdown-list');

            //create list items with links for the dropdown list
            const frdListItem=document.createElement('li');
            const frdLink=document.createElement('a');
            frdLink.href = '#';
            frdLink.innerHTML=`<i class="ri-share-forward-line"></i> Forward`;
            frdListItem.appendChild(frdLink);

            const deleteListItem=document.createElement('li');
            const deleteLink=document.createElement('a');
            deleteLink.href = '#';
            deleteLink.innerHTML=`<i class="ri-share-forward-line"></i> Forward`;
            deleteListItem.appendChild(deleteLink);

            dropdownList.appendChild(frdListItem);
            dropdownList.appendChild(deleteListItem);

            // Append the conversation-item-text and conversation-item-dropdown divs to the conversation-item-box div
			boxDiv.appendChild(textDiv);
            boxDiv.appendChild(dropdownList);

            // Append the conversation-item-box div to the conversation-item-wrapper div
			wrapperDiv.appendChild(boxDiv);

            // Append the conversation-item-wrapper div to the conversation-item-content div
            contentDiv.appendChild(wrapperDiv);

            // Append the conversation-item-content div to the list item
            listItem.appendChild(sideDiv);
            listItem.appendChild(contentDiv);

            // Get the conversation-wrapper ul element
            const conservationWrapper =document.querySelector('.conversation-wrapper');

            //append the list item to the conservation wrapper ul element 
            conservationWrapper.appendChild(listItem);

        }else{
            const listItem = document.createElement("li");

			// Determine the CSS class based on message status
			if (item.messageStatus === "received") {
				listItem.classList.add("conversation-item", "me");
			} else {
				listItem.classList.add("conversation-item");
			}

			// Create the conversation-item-side div
			const sideDiv = document.createElement("div");
			sideDiv.classList.add("conversation-item-side");

			// Create the image element
			const image = document.createElement("img");
			image.classList.add("conversation-item-image");
			image.src = `${profile_picture}`; // Use the actual sender's profile picture URL
			image.alt = "";

			// Append the image to the conversation-item-side div
			sideDiv.appendChild(image);

			// Create the conversation-item-content div
			const contentDiv = document.createElement("div");
			contentDiv.classList.add("conversation-item-content");

			// Create the conversation-item-wrapper div
			const wrapperDiv = document.createElement("div");
			wrapperDiv.classList.add("conversation-item-wrapper");

			// Create the conversation-item-box div
			const boxDiv = document.createElement("div");
			boxDiv.classList.add("conversation-item-box");

			// Create the conversation-item-text div
			const textDiv = document.createElement("div");
			textDiv.classList.add("conversation-item-text");

			// Create the paragraph element for the message content
			const messageParagraph = document.createElement("p");
			messageParagraph.textContent = item.content;

			// Create the conversation-item-time div for the timestamp
			const timeDiv = document.createElement("div");
			timeDiv.classList.add("conversation-item-time");
			timeDiv.textContent = item.createdAt;

			// Append the message content and timestamp to the conversation-item-text div
			textDiv.appendChild(messageParagraph);
			textDiv.appendChild(timeDiv);

			// Create the conversation-item-dropdown div
			const dropdownDiv = document.createElement("div");
			dropdownDiv.classList.add("conversation-item-dropdown");

			// Create the dropdown toggle button
			const toggleButton = document.createElement("button");
			toggleButton.setAttribute("type", "button");
			toggleButton.classList.add("conversation-item-dropdown-toggle");
			toggleButton.innerHTML = `<i class="ri-more-2-line"></i>`;

			// Create the dropdown list
			const dropdownList = document.createElement("ul");
			dropdownList.classList.add("conversation-item-dropdown-list");

			// Create list items with links for the dropdown
			const forwardListItem = document.createElement("li");
			const forwardLink = document.createElement("a");
			forwardLink.href = "#";
			forwardLink.innerHTML = '<i class="ri-share-forward-line"></i> Forward';
			forwardListItem.appendChild(forwardLink);

			const deleteListItem = document.createElement("li");
			const deleteLink = document.createElement("a");
			deleteLink.href = "#";
			deleteLink.innerHTML = '<i class="ri-delete-bin-line"></i> Delete';
			deleteListItem.appendChild(deleteLink);

			// Append the list items to the dropdown list
			dropdownList.appendChild(forwardListItem);
			dropdownList.appendChild(deleteListItem);

			// Append the dropdown toggle button and dropdown list to the conversation-item-dropdown div
			dropdownDiv.appendChild(toggleButton);
			dropdownDiv.appendChild(dropdownList);

			// Append the conversation-item-text and conversation-item-dropdown divs to the conversation-item-box div
			boxDiv.appendChild(textDiv);
			boxDiv.appendChild(dropdownDiv);

			// Append the conversation-item-box div to the conversation-item-wrapper div
			wrapperDiv.appendChild(boxDiv);

			// Append the conversation-item-wrapper div to the conversation-item-content div
			contentDiv.appendChild(wrapperDiv);

			// Append the conversation-item-content div to the list item
			listItem.appendChild(sideDiv);
			listItem.appendChild(contentDiv);

			// Get the conversation-wrapper ul element
			const conversationWrapper = document.querySelector(".conversation-wrapper");

			// Append the list item to the conversation-wrapper ul element
			conversationWrapper.appendChild(listItem);
        }
    }catch(err){console.log(err)}
}
async function generationChat(id) {
    // Clearing the container
    const container = document.querySelector(".conversation-user");
    container.innerHTML = "";

    try {
        const response = await axios.get(`${baseUrl}/user/getchat/${id}`, {
            headers: { Authorization: token },
        });
        const userData = response.data.user;

        localStorage.setItem("currentUser", id);
        localStorage.setItem("chatStatus", "true");

        // Generate and display the chat head
        await generateHead(userData);

        let messages = 0;
        profile_picture = userData.profile_picture;
        const chats = await getChatApi(id);

        if (messages === 0 || messages < chats.length) {
            messages = chats.length;
            await generateMain(chats, profile_picture);
        }

        // Set up an interval to check for new messages every 1 second
        setInterval(async () => {
            const newChats = await getChatApi(id);

            if (newChats.length > messages) {
                messages = newChats.length;
                // Update the screen with new messages
                await generateMain(newChats, profile_picture);
            }
        }, 1000);
    } catch (err) {
        console.log(err);
    }
}

async function getChatApi(id){
    try{
        const response =await axios.get(`${baseUrl}/chat/get-chat/${id}`,{
            headers:{
                Authorization:token
            }
        });
        if (response.status === 200) {
            console.log(response.data);
			const messages = response.data.data;
			localStorage.setItem("Messages", JSON.stringify(messages));
			return messages;
		} else {
			throw new Error(`Failed to fetch chat messages. Status code: ${response.status}`);
		}
    }catch(err){
        console.log(err);
    }
}
subtButton.addEventListener('click', ()=>{
    try{
        const openedChat=localStorage.getItem('chatActive');
        const chatId=localStorage.getItem("currentUser");
        const groupId=localStorage.getItem('currentGroup');

        if(openedChat==='user'){
            console.log("sending a user message");
            sendChat(chatId);
        }else if(openedChat==='group'){
            console.log("sending a group message");
            sendGroupId(groupId);
        }else{
            console.log("invalid chat type",openedChat)
        }
    }catch(err){
        console.log(err)
    }
})

async function sendChat(id){
    try{
    
    const receiver =localStorage.getItem('currentUser');
    const conservationType=localStorage.getItem('chatActive');

    const messageBox=document.getElementById('chat-box');
    const messageDetails={
        content:messageBox.value,
        receiver:receiver,
        conservationType:conservationType,
        timeStamp:new Date(),
        messageStatus:"sent",
    }
    const response=await axios.post(`${baseUrl}/chat/sendMessage`,messageDetails,{
        headers:{
            Authorization:token,
        }
    })
    if(response.status===200){
        profile_picture=response.data.user.profile_picture;
        createmessage(messageDetails,profile_picture);
        console.log(messageBox.value);
        messageBox.value='';
    }else{
        console.log('response failed in sendMessage')
    }
    }catch(err){
        console.log(err);
    }   
}
async function getAllGroups(){
    console.log("Getting all Groups");
}