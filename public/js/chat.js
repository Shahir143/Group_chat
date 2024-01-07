const baseUrl=process.env.BASE_URL;
const token=localStorage.getItem('token');

const container=document.querySelector('.content-messages-list');
const contentmessageContainer=document.getElementsByClassName('group-add');
const groupAdd=document.getElementById('groupAddDiv');
const modalOpen=document.getElementById('add-group-link');
const subtButton=document.getElementById('submit-button');
const conservation=document.querySelectorAll('.conversation');

const cancelAddMemberButton=document.getElementById('cancelAddMembersBtn');
const groupAddButton=document.getElementsByClassName('group-add-button');
const profileToggleBtn=document.getElementById(".chat-sidebar-profile-toggle");
const infoButton = document.getElementById("info-button-group");
const addMembersModal = document.getElementById("addMembersModal");
const closeAddMembersModal = document.getElementById("closeAddMembersModal");
const addMembersbutton = document.getElementById("manage-button");
const multiMediaButton = document.getElementById("attachment");
const attachButton = document.getElementById("sendAttachmentButton");
const fileInput = document.getElementById("fileInput");
const attachmentModal = document.getElementById("attachmentModal");
const cancelButton = document.getElementById("cancelAttachmentButton");


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
                // Remove 'active' class from all conversations
                document.querySelectorAll(".conversation").forEach(function (i) {
                    i.classList.remove("active");
                });

                console.log(document.querySelector(".conversation"))
                // Show the selected conversation
                document.querySelector("#conversation-1").classList.add("active");

                // Set the chat as active
                localStorage.setItem("chatActive", "user");
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
    img.src=`${data.profile_picture}`
    img.alt=`${data.username}`;
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
        img.src = `${userData.profile_picture}`;
        img.alt = `${userData.username}`;
        divWrapper.classList.add('conversation-user-details'); // Fix typo here
        divName.textContent = `${userData.username}`;
        divStatus.classList.add('conversation-user-status', `online`); // Assuming 'online' is a class
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

async function generateMain(chat, data){
    try{
        clearChatMessages();
        for(const item of chat){
            await createmessage(item,data);

        }
    }catch(err){
        console.log("error in generationMain",err);
    }
}
function clearChatMessages(){
    const chatArea = document.querySelector(".conversation-wrapper");
    chatArea.innerHTML="";
}
async function createmessage(item,data){
    console.log("item for create message",data)
    try{
        if(item.isAttachment===true){
            const listItem = document.createElement("li");
            const sideDiv = document.createElement("div");
			sideDiv.classList.add("conversation-item-side");

			// Create the image element
			const image = document.createElement("img");
			image.classList.add("conversation-item-image");// Use the actual sender's profile picture URL
			image.alt = "";

			// Determine the CSS class based on message status
			if (item.messageStatus === "received") {
				listItem.classList.add("conversation-item", "me");
                image.src = `${data.details.profile_picture}`;
			} else {
				listItem.classList.add("conversation-item");
                image.src = `${data.user.profile_picture}`;
			}


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
            const sideDiv = document.createElement("div");
			sideDiv.classList.add("conversation-item-side");

			// Create the image element
			const image = document.createElement("img");
			image.classList.add("conversation-item-image");// Use the actual sender's profile picture URL
			image.alt = "";

			// Determine the CSS class based on message status
			if (item.messageStatus === "received") {
				listItem.classList.add("conversation-item", "me");
                image.src = `${data.details.profile_picture}`;
			} else {
				listItem.classList.add("conversation-item");
                image.src = `${data.user.profile_picture}`;
			}
			

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
        const response = await axios.get(`${baseUrl}/user/getchat/${id}`, {headers: { Authorization: token },});
        console.log(response.data)
        const userData = response.data.user;
        localStorage.setItem("currentUser", id);
        localStorage.setItem("chatStatus", "true");

        // Generate and display the chat head
        await generateHead(userData);

        let messages = 0;
        profile_picture = userData.profile_picture;
        const reqData = await getChatApi(id);
        const chats=reqData.messages;
        if (messages === 0 || messages < chats.length) {

            messages = chats.length;
            await generateMain(chats, reqData);
    }

    } catch (err) {
        console.log(err);
    }
}

async function getChatApi(id){
    try{
        const response =await axios.get(`${baseUrl}/chat/get-chat/${id}`,{headers:{Authorization:token}});
        if (response.status === 200) {
            console.log("getChatApi",response.data.data);
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
            sendGroupMsg(groupId);
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
        profile_picture=response.data;
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
    try{
        conservation[1].classList.remove('active');
        conservation[0].classList.add('active');
        container.innerHTML="";
        groupAdd.classList.toggle('active');

        const response=await axios.get(`${baseUrl}/groups/getGroups`,{
            headers:{Authorization:token}
        })
        if(response && response.data && response.data.data){
            const groups=response.data.data;
            for(const group of groups){
                await createGroupCard(group);
            }
        }
        document.querySelectorAll("[data-conversation]").forEach(function (item) {
            item.addEventListener("click", async function (e) {
                e.preventDefault();
                const groupId = item.id;

                // Remove 'active' class from all conversations
                document.querySelectorAll(".conversation").forEach(function (i) {
                    i.classList.remove("active");
                });

                // Show the selected conversation
                document.querySelector("#conversation-1").classList.add("active");

                // Set the chat as active
                localStorage.setItem("chatActive", "group");

                // Generate the chat for the selected friend (assuming you have a function named generateChat)
                await generationGroupChat(groupId)
            })
        })
    }catch(err){
        console.log("Error in geting groups",err)
    }
}
async function generationGroupChat(id){
    try{
        const container=document.querySelector('.conversation-user');
        container.innerHTML="";

        const response=await axios.get(`${baseUrl}/user/getGroupchat/${id}`,{headers:{Authorization:token},});

        console.log("response",response)
        const userData=response.data.data.group;
        localStorage.setItem('currentGroup',userData.id);
        localStorage.setItem('chatStatus','true');
        const reqData=response.data.data
        await groupHead(userData);

        const consersationWrapper=document.querySelector('.conversation-wrapper');

        let groupMessages=0;
        const groupChats=await getGroupApi(id);

        if(groupMessages===0||groupChats<groupChats.length){
            groupMessages=groupChats.length;
            await groupMain(groupChats,reqData);
        }
    }catch(err){
        console.log("Error in generating groups",err)
    }
}
async function groupHead(userData){
    try{
        console.log(userData);
        const container = document.querySelector(".conversation-user");

		const img = document.createElement("img");
		const divWrapper = document.createElement("div");
		const divName = document.createElement("div");
		const divStatus = document.createElement("div");

		// Set attributes and text content
		img.classList.add("conversation-user-image");
		img.src = `${userData.profile_picture}`;
		img.alt = "";
		divWrapper.classList.add("conversation-user-details");
		divName.classList.add("conversation-user-name");
		divName.textContent = `${userData.group_name}`;
		divStatus.classList.add("conversation-user-status", "online");
		divStatus.textContent = "online";

		// Append elements to build the structure
		divWrapper.appendChild(divName);
		divWrapper.appendChild(divStatus);

		// Clear the container before appending new elements
		container.innerHTML = "";

		// Append the newly created structure to the container
		container.appendChild(img);
		container.appendChild(divWrapper);
		updateChatButtons();
    }catch(err){
        console.log("Error in generating group heads",err)
    }
}
async function groupMain(data,profile_picture){
    try{
        for(const item of data){
            console.log(item);
            await createmessage(item,profile_picture);
        }
    }catch(err){console.log("Error in groupMain",err)}
}
async function getGroupApi(groupId){
    try{
        const response=await axios.get(`${baseUrl}/chat/getGroupchat/${groupId}`,{headers:{Authorization:token},})
        if(response.status===200){
            const groupMessages=response.data.data;
            localStorage.setItem("GroupMessages",JSON.stringify(groupMessages));
            return groupMessages;
        }else{
            console.log("Failed to fetch group chat messages")
        }
    }catch(err){console.log("Error in getgroupsApi",err)}
}
function createGroup(){
    console.log('create group');
    const modal =document.getElementById('myModel');
    const closeModel=document.getElementById("closeModel");

    modal.style.display="block";

    closeModel.addEventListener("click",function(){
        modal.style.display="none";
    })
    window.addEventListener("click",function(e){
        if(e.target==modal){
            modal.style.display='none';
        }
    })
}

infoButton.addEventListener("click",async()=>{
    const groupId=localStorage.getItem("currentGroup");
    try{
        const checkAdmin=await axios.get(`${baseUrl}/groups/${groupId}/isAdmin`,{
            headers:{Authorization:token}
        });
        console.log(checkAdmin.data);
        const {isAdmin}=checkAdmin.data;
        if(isAdmin===true){
            addMembersModal.style.display="block";
            const response=await axios.get(`${baseUrl}/groups/${groupId}/contacts`,{
                headers:{Authorization:token}
            });
            const {nonExistingUsers, existingUsers, nonAdminUsers}=response.data.data;
            console.log('nonExistingUsers, existingUsers, nonAdminUsers',nonExistingUsers, existingUsers, nonAdminUsers)
            const addUserBoxes = document.getElementById("invite-members");
			const existingUserBoxes = document.getElementById("group-members");
			const addAdminBoxes = document.getElementById("add-admin");
			addUserBoxes.innerHTML = "";
			existingUserBoxes.innerHTML = "";
            if(nonExistingUsers.length>0){
                addUserBoxes.innerHTML=`<p>Invite Users</p><br/>`;
                const boxedDiv=document.createElement("div");
                nonExistingUsers.forEach((nonExistingUser)=>{
                    const checkBox=document.createElement("input");
                    checkBox.type="checkbox";
                    checkBox.name="addUsers";
                    checkBox.value=nonExistingUser.id;
                    checkBox.id=`addUserBox-${nonExistingUser.id}`;

                    const label =document.createElement('label');
                    label.setAttribute("for", `addUserBox-${nonExistingUser.id}`);
					label.innerText = nonExistingUser.username;

					boxedDiv.appendChild(checkBox);
					boxedDiv.appendChild(label);
				});
				const buttonDiv = document.createElement("div");
				const addMembersbutton = document.createElement("button");

				// Set attributes and properties for the button
				addMembersbutton.setAttribute("type", "submit");
				addMembersbutton.setAttribute("id", "confirmAddMembersBtn");
				addMembersbutton.textContent = "Add Members";
				buttonDiv.appendChild(addMembersbutton);

				addUserBoxes.appendChild(boxedDiv);
				addUserBoxes.appendChild(buttonDiv);
				addMembersbutton.addEventListener("click", async (e) => {
					e.preventDefault();
					try {
						// Get all checkboxes with the name "selectedUsers"
						const checkboxes = document.querySelectorAll('input[name="addUsers"]');

						// Create an array to store the IDs of checked checkboxes
						const checkedUserIds = [];

						checkboxes.forEach((checkbox) => {
							if (checkbox.checked) {
								// If a checkbox is checked, add its value (which should be the user ID) to the array
								checkedUserIds.push(checkbox.value);
							}
						});

						// Prepare the data for the group invitation
						const details = {
							user_ids: checkedUserIds,
						};

						// Get the current group's ID from local storage
						//groupId
						const getGroup = JSON.parse(localStorage.getItem("currentGroup"));

						// Send an invite to the selected users
						const response = await axios.post(`${baseUrl}/groups/${getGroup}/invite`, details, {
							headers: { Authorization: token },
						});

						// // Handle the response as needed
						console.log("Invitation sent successfully:", response);

						// Close the "Add Members" modal
						addMembersModal.style.display = "none";

						// You can perform additional actions based on the response, such as updating the UI.
					} catch (error) {
						console.error("Error handling Add Member button click:", error);

						// Handle errors, display an error message, or take appropriate actions.
					}
				});
			}
			if (existingUsers.length > 0) {
				existingUserBoxes.innerHTML = `<p>Manage users</p> <br/>`;
				const boxedDiv = document.createElement("div");
				existingUsers.forEach((existingUser) => {
					const checkBox = document.createElement("input");
					checkBox.type = "checkbox";
					checkBox.name = "deleteusers";
					checkBox.value = existingUser.id;
					checkBox.id = `addUserBox-${existingUser.id}`;

					const label = document.createElement("label");
					label.setAttribute("for", `addUserBox-${existingUser.id}`);
					label.innerText = existingUser.username;
					boxedDiv.appendChild(checkBox);
					boxedDiv.appendChild(label);
				});
				const buttonDiv = document.createElement("div");
				const delbutton = document.createElement("button");

				
				delbutton.setAttribute("type", "submit");
				delbutton.setAttribute("id", "deleteUserButton");
				delbutton.textContent = "Delete Member";
				buttonDiv.appendChild(delbutton);

				existingUserBoxes.appendChild(boxedDiv);
				existingUserBoxes.appendChild(buttonDiv);
				delbutton.addEventListener("click", async (e) => {
					e.preventDefault();
					try {
						
                        const checkboxes = document.querySelectorAll('input[name="deleteusers"]');

						const checkedUserIds = [];

						checkboxes.forEach((checkbox) => {
							if (checkbox.checked) {
								
                                checkedUserIds.push(checkbox.value);
							}
						});

						const details = {
							user_ids: checkedUserIds,
						};

						const response = await axios.post(`${baseUrl}/groups/${groupId}/delete`, details, {
							headers: { Authorization: token },
						});

						console.log("User removed  successfully:", response);

						addMembersModal.style.display = "none";

						} catch (error) {
						console.error("Error handling Add Member button click:", error);

						}
				});
			}
            
			if (nonAdminUsers.length > 0) {
				addAdminBoxes.innerHTML = `<p>Make Admin</p> <br/>`;
				const boxedDiv = document.createElement("div");
				nonAdminUsers.forEach((nonAdminUser) => {
					const checkBox = document.createElement("input");
					checkBox.type = "checkbox";
					checkBox.name = "makeadmin";
					checkBox.value = nonAdminUser.id;
					checkBox.id = `addUserBox-${nonAdminUser.id}`;

					const label = document.createElement("label");
					label.setAttribute("for", `addUserBox-${nonAdminUser.id}`);
					label.innerText = nonAdminUser.username;
					boxedDiv.appendChild(checkBox);
					boxedDiv.appendChild(label);
				});
				const buttonDiv = document.createElement("div");
				const addAdminButton = document.createElement("button");

				addAdminButton.setAttribute("type", "submit");
				addAdminButton.setAttribute("id", "makeAdminButton");
				addAdminButton.textContent = "Make Admin";
				buttonDiv.appendChild(addAdminButton);

				addAdminBoxes.appendChild(boxedDiv);
				addAdminBoxes.appendChild(buttonDiv);

				addAdminButton.addEventListener("click", async (e) => {
					e.preventDefault();
					try {
						
                        const checkboxes = document.querySelectorAll('input[name="makeadmin"]');

                        const checkedUserIds = [];

						checkboxes.forEach((checkbox) => {
							if (checkbox.checked) {
								checkedUserIds.push(checkbox.value);
							}
						});

						const details = {
							user_ids: checkedUserIds,
						};

						const response = await axios.post(`${baseUrl}/groups/${groupId}/admin`, details, {
							headers: { Authorization: token },
						});

						console.log("Admin updated  successfully:", response);

						addMembersModal.style.display = "none";

						} catch (error) {
						console.error("Error handling Add Member button click:", error);

						}
				});
			}
		}
	} catch (error) {
		console.log("Error handling infoButton click:", error);
		}
});
closeAddMembersModal.addEventListener("click", () => {
	addMembersModal.style.display = "none";
});

cancelAddMemberButton.addEventListener("click", () => {
	addMembersModal.style.display = "none";
});

function toggleProfileSidebar(e) {
	try {
		e.preventDefault();
		const parentElement = this.parentElement;
		if (parentElement) {
			parentElement.classList.toggle("active");
		}
	} catch (error) {
		console.error("Error toggling profile sidebar:", error);
	}
}

if (profileToggleBtn) {
	profileToggleBtn.addEventListener("click", toggleProfileSidebar);
}

function closeProfileSidebarOnClick(e) {
	try {
		if (!e.target.matches(".chat-sidebar-profile, .chat-sidebar-profile *")) {
			const profileSidebar = document.querySelector(".chat-sidebar-profile");
			if (profileSidebar) {
				profileSidebar.classList.remove("active");
			}
		}
	} catch (error) {
		console.error("Error handling click event:", error);
	}
}

document.addEventListener("click", closeProfileSidebarOnClick);

function toggleConversationItemDropdown(e) {
	try {
		e.preventDefault();
		const parentElement = this.parentElement;
		if (parentElement.classList.contains("active")) {
			parentElement.classList.remove("active");
		} else {
			// Deactivate all other conversation item dropdowns
			document.querySelectorAll(".conversation-item-dropdown").forEach(function (item) {
				item.classList.remove("active");
			});
			parentElement.classList.add("active");
		}
	} catch (error) {
		console.error("Error handling click event:", error);
	}
}

document.querySelectorAll(".conversation-item-dropdown-toggle").forEach(function (item) {
	item.addEventListener("click", toggleConversationItemDropdown);
});

function handleOutsideClick(e) {
	try {
		if (!e.target.matches(".conversation-item-dropdown, .conversation-item-dropdown *")) {
			// Deactivate all conversation item dropdowns
			document.querySelectorAll(".conversation-item-dropdown").forEach(function (item) {
				item.classList.remove("active");
			});
		}
	} catch (error) {
		console.error("Error handling click event:", error);
	}
}

document.addEventListener("click", handleOutsideClick);

function adjustTextareaRows(event) {
	try {
		const textarea = event.target;
		textarea.rows = textarea.value.split("\n").length;
	} catch (error) {
		console.error("Error adjusting textarea rows:", error);
	}
}

document.querySelectorAll(".conversation-form-input").forEach(function (item) {
	item.addEventListener("input", adjustTextareaRows);
});

function handleConversationClick(event) {
	try {
		event.preventDefault();

		// Deactivate all conversation elements
		document.querySelectorAll(".conversation").forEach(function (conversation) {
			conversation.classList.remove("active");
		});

		// Activate the selected conversation element
		const targetConversation = document.querySelector(event.target.dataset.conversation);
		if (targetConversation) {
			targetConversation.classList.add("active");
		}
	} catch (error) {
		console.error("Error handling conversation click:", error);
	}
}

document.querySelectorAll("[data-conversation]").forEach(function (item) {
	item.addEventListener("click", handleConversationClick);
});

function handleConversationBackClick(event) {
	try {
		event.preventDefault();

		// Deactivate the current conversation
		const currentConversation = event.target.closest(".conversation");
		if (currentConversation) {
			currentConversation.classList.remove("active");
		}

		// Activate the default conversation
		const defaultConversation = document.querySelector(".conversation-default");
		if (defaultConversation) {
			defaultConversation.classList.add("active");
		}
	} catch (error) {
		console.error("Error handling conversation back click:", error);
	}
}

document.querySelectorAll(".conversation-back").forEach(function (item) {
	item.addEventListener("click", handleConversationBackClick);
});
function isInputEmpty(input) {
	return input.value.trim() === "";
}
function handleModal() {
	console.log("modal opened");
	try {
		const modal = document.getElementById("myModal");
		const closeModalButton = document.getElementById("closeModal");
		const confirmButton = document.getElementById("confirmBtn");
		const cancelButton = document.getElementById("cancelBtn");


		modal.style.display = "block";

		closeModalButton.addEventListener("click", () => {
			modal.style.display = "none"; 
		});

		// Add an event listener to handle form submission

		confirmButton.addEventListener("click", async (e) => {
			try {
				e.preventDefault();

				const groupName = document.getElementById("groupName").value;
                const groupDescription = document.getElementById("groupDescription").value;
                const profile_picture= document.getElementById('groupPicture');

                
               
                if(isInputEmpty(profile_picture)){
                    profile_picture.value="https://cdn6.aptoide.com/imgs/1/2/2/1221bc0bdd2354b42b293317ff2adbcf_icon.png"
                }

                const groupDetails = {
                    group_name: groupName,
                    group_description: groupDescription,
                    profile_picture: profile_picture.value
                };

                console.log(groupDetails);
				// Send a POST request to the server to create the group
				const response = await axios.post(`${baseUrl}/groups/create-group`, groupDetails, {
					headers: { Authorization: token },
				});

                console.log(response.data)
                const group=response.data.data;
				modal.style.display = "none";
                await createGroupCard(group);

                const groupId = group.id;

                // Remove 'active' class from all conversations
                document.querySelectorAll(".conversation").forEach(function (i) {
                    i.classList.remove("active");
                });

                // Show the selected conversation
                document.querySelector("#conversation-1").classList.add("active");

                // Set the chat as active
                localStorage.setItem("chatActive", "group");

                // Generate the chat for the selected friend (assuming you have a function named generateChat)
                await generationGroupChat(groupId)
			} catch (error) {
				console.error("Error submitting form:", error);
				}
		});

		cancelButton.addEventListener("click", () => {
			modal.style.display = "none"; // Hide the modal
		});
	} catch (error) {
		console.error("Error handling modal:", error);
		}
}

modalOpen.addEventListener("click", handleModal);


async function getSelfDetails() {
	const selfDetails = await axios.get(`${baseUrl}/user/self`, { headers: { Authorization: token } });
	profile_picture = selfDetails.data.data.profile_picture;
    console.log(selfDetails)
}

getSelfDetails();
function createGroupCard(data) {
	try {
		// Create the elements
		const li = document.createElement("li");
		const a = document.createElement("a");
		const img = document.createElement("img");
		const info = document.createElement("span");
		const nameSpan = document.createElement("span");
		const textSpan = document.createElement("span");
		const more = document.createElement("span");

		// Set attributes and text content
		a.href = "#";
		a.id = `${data.id}`;
		a.setAttribute("data-conversation", "#conversation-1"); // Set the data-conversation attribute
		img.classList.add("content-message-image");
		img.src = `${data.profile_picture}`;
		img.alt = "";
		nameSpan.classList.add("content-message-name");
		nameSpan.textContent = `${data.group_name}`;
		textSpan.classList.add("content-message-text");
		textSpan.textContent = `${data.group_description}`;

		// Append elements to build the structure
		a.appendChild(img);
		a.appendChild(info);
		info.appendChild(nameSpan);
		info.appendChild(textSpan);
		a.appendChild(more);
		li.appendChild(a);

		// Append the newly created structure to the container
		container.appendChild(li);
	} catch (error) {
		console.error("Error in createGroupCard:", error);
		// Optionally, you can handle errors here, such as displaying an error message to the user.
	}
}
async function sendGroupMsg(groupId) {
	try {
		// Get the receiver (current group) and conversation type from local storage
		const receiver = localStorage.getItem("currentGroup");
		const conversation_type = localStorage.getItem("chatActive");

		// Get the message text from the chat box
        
		const chatBox = document.getElementById("chat-box");
		const message = chatBox.value;

		// Check if the message is empty before sending
		if (!message.trim()) {
			console.log("Message cannot be empty.");
			return;
		}

		// Create a message detail object
		const messageDetail = {
			content: message,
			conversation_type: conversation_type,
			receiver: receiver,
			timeStamp: new Date(),
			messageStatus: "sent",
		};

		//Use the socket associated with this group
        const response=await axios.post(`${baseUrl}/chat/sendGroupChat`,messageDetail,{
            headers:{
                Authorization:token,
            }
        })
        console.log(response.data.data)
        
        if(response.status===200){
            profile_picture=response.data.data;
            createmessage(messageDetail,profile_picture);
            console.log(chatBox.value);
            chatBox.value='';
        }else{
            console.log('response failed in sendMessage')
        }
        
		// Clear the chat box after sending
		chatBox.value = "";
	} catch (error) {
		console.error("Error sending group message:", error.message);
		// You can add additional error handling logic here, such as displaying an error message to the user.
	}
}
