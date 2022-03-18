const {ipcRenderer} = require('electron')

let mloInputsIdArray = ['mloXPos','mloYPos','mloZPos','mloWRot','mloXRot','mloYRot','mloZRot']

let activeState = 1
let propsData
let lastSelectedObject


handleObjectSelection = () =>{
	let ulElements = document.getElementsByTagName('li')
	for(i=0; i< ulElements.length; i++){
		ulElements[i].onclick = (element) =>{
			if(!element.target.classList.contains('active')){
				if(lastSelectedObject){
					lastSelectedObject.target.classList.remove("active")
				}
				updateYTYPWorkspace(parseInt(element.target.getAttribute('data-id')))
				element.target.classList.add("active")
				console.log('Selected item has id of:',element.target.getAttribute('data-id') )
				lastSelectedObject = element
			}
		}
	}
}

isFloat = (val) => {
    var floatRegex = /^-?\d+(?:[.,]\d*?)?$/;
    if (!floatRegex.test(val))
        return false;

    val = parseFloat(val);
    if (isNaN(val))
        return false;
    return true;
}

manageTooltips = () => {
	for(i=0; i<mloInputsIdArray.length; i++){
		
		let item = document.getElementById(mloInputsIdArray[i]+'TipIcon')
		item.onmouseover  = (element) =>{
			element.target.parentNode.children[3].style.display = 'block'
		}

		item.onmouseout = (element) =>{
			element.target.parentNode.children[3].style.display = 'none'
		} 
	}
}

processMLOData = () => {
	
	let mloCoords = []
	let mloRot = []

	// Fill mloCoords array
	for(i=0; i<mloInputsIdArray.length; i++){
		if(i<3){
			let ele = document.getElementById(mloInputsIdArray[i])
			mloCoords.push(parseFloat(ele.value).toFixed(6))
		}
		else{
			let ele = document.getElementById(mloInputsIdArray[i])
			mloRot.push(parseFloat(ele.value).toFixed(6))
		}
	}

	let isAnyValueInvalid = false
	for (i=0; i<mloInputsIdArray.length; i++){
		if(i<3){
			if(!isFloat(mloCoords[i]) || mloCoords[i] == null){
				document.getElementById(mloInputsIdArray[i]+'TipIcon').style.display = 'block'
				isAnyValueInvalid = true
			}
			else{
				let activeStyle = document.getElementById(mloInputsIdArray[i]+'TipIcon').style.display
				if(activeStyle == 'block'){
					document.getElementById(mloInputsIdArray[i]+'TipIcon').style.display = 'none'
				}
			}
		}
		else{
			if(!isFloat(mloRot[i-3]) || mloRot[i-3] == null){
				document.getElementById(mloInputsIdArray[i]+'TipIcon').style.display = 'block'
				isAnyValueInvalid = true
			}
			else{
				let activeStyle = document.getElementById(mloInputsIdArray[i]+'TipIcon').style.display
				if(activeStyle == 'block'){
					document.getElementById(mloInputsIdArray[i]+'TipIcon').style.display = 'none'
				}
			}
		}
	}
	if(isAnyValueInvalid){
		return
	}
	else{

		console.log('MLO Info entered are:', mloCoords, mloRot);
		ipcRenderer.send('setMLOInfo', mloCoords, mloRot)
		activeState += 1
		setProjectState()
	}
}

setProjectState = () => {
	switch(activeState){
		case 1:
			document.getElementById('mloWorkspace').style.display = 'contents'
			document.getElementById('ymapImportText').style.display = 'none'
			document.getElementById('ymapImportWorkspace').style.display = 'none'
			document.getElementById('ytypWorkspace').style.display = 'none'
			document.getElementById('ytypObjectText').style.display = 'none'
			document.getElementById('objectListBox').style.display = 'none'
			document.getElementById('ytypResultArea').style.display = 'none'
			document.getElementById('exportYTYPButton').style.display = 'none'
			break
		case 2:
			document.getElementById('mloWorkspace').style.display = 'none'
			document.getElementById('ymapImportText').style.display = 'block'
			document.getElementById('ymapImportWorkspace').style.display = 'flex'
			document.getElementById('ytypWorkspace').style.display = 'none'
			document.getElementById('ytypObjectText').style.display = 'none'
			document.getElementById('objectListBox').style.display = 'none'
			document.getElementById('ytypResultArea').style.display = 'none'
			document.getElementById('exportYTYPButton').style.display = 'none'
			break
		case 3:
			document.getElementById('mloWorkspace').style.display = 'none'
			document.getElementById('ymapImportWorkspace').style.display = 'none'
			document.getElementById('ytypWorkspace').style.display = 'unset'
			document.getElementById('ytypObjectText').style.display = 'block'
			document.getElementById('objectListBox').style.display = 'block'
			document.getElementById('ytypResultArea').style.display = 'none'
			document.getElementById('exportYTYPButton').style.display = 'block'
			handleObjectSelection()
			break
		case 4:
			document.getElementById('mloWorkspace').style.display = 'none'
			document.getElementById('ymapImportWorkspace').style.display = 'none'
			document.getElementById('ytypWorkspace').style.display = 'none'
			document.getElementById('ytypObjectText').style.display = 'block'
			document.getElementById('objectListBox').style.display = 'none'
			document.getElementById('ytypResultArea').style.display = 'block'
			document.getElementById('exportYTYPButton').style.display = 'none'

		default:
			break
	}
}


createObjectListing = () => {
	if(propsData){
		document.getElementById("objectListBox").innerHTML = ''
		let objectListUL = document.getElementById('objectListBox')
		for(i=1; i<propsData.length; i++){
			
			let objectListing = document.createElement("li");	
			objectListing.appendChild(document.createTextNode(propsData[i]['name']));
			objectListing.setAttribute('data-id', i)
			objectListing.classList.add('text-md')
			objectListing.classList.add('m-0')
			objectListing.classList.add('px-2')
			objectListUL.appendChild(objectListing)
			console.log('Appended', );
		}
		handleObjectSelection()
	}
}


updateYTYPWorkspace = (index) => {
	let archetypeName = propsData[index]['name']
	let archetypePosition = propsData[index]['position']
	let archetypeRotation = propsData[index]['rotation']
	let archetypeFlags = propsData[index]['flags']
	
	document.getElementById('archetypeName').innerText = archetypeName
	document.getElementById('flags').value = archetypeFlags
	document.getElementById('ytypXPos').value = (archetypePosition.x).toFixed(6)
	document.getElementById('ytypYPos').value = (archetypePosition.y).toFixed(6)
	document.getElementById('ytypZPos').value = (archetypePosition.z).toFixed(6)
	document.getElementById('ytypWRot').value = (archetypeRotation.w).toFixed(6)
	document.getElementById('ytypXRot').value = (archetypeRotation.x).toFixed(6)
	document.getElementById('ytypYRot').value = (archetypeRotation.y).toFixed(6)
	document.getElementById('ytypZRot').value = (archetypeRotation.z).toFixed(6)
}


createYtypExport = (data) => {
	if(!data || data == null){
		return
	}

	let ytypObject = ''
	
	for(index=1; index<data.length; index++){
		let archetypeName = data[index]['name']
		let archetypePosition = data[index]['position']
		let archetypeRotation = data[index]['rotation']
		let archetypeFlags = data[index]['flags']

		ytypObject += '<Item type="CEntityDef">\n'
		ytypObject += '\t<archetypeName>'+archetypeName+'</archetypeName>\n'
		ytypObject += '\t<flags value="'+archetypeFlags+'"/>\n'
		ytypObject += '\t<position x="'+archetypePosition.x+'" y="'+archetypePosition.y+'" z="'+archetypePosition.z+'"/>\n'
		ytypObject += '\t<rotation w="'+archetypeRotation.w+'" x="'+archetypeRotation.x+'" y="'+archetypeRotation.y+'" z="'+archetypeRotation.z+'"/>\n'
		ytypObject += '\t<scaleXY value="1"/>\n'
		ytypObject += '\t<scaleZ value="1"/>\n'
		ytypObject += '\t<parentIndex value="-1"/>\n'
		ytypObject += '\t<lodDist value="500"/>\n'
		ytypObject += '\t<childLodDist value="500"/>\n'
		ytypObject += '\t<lodLevel>LODTYPES_DEPTH_HD</lodLevel>\n'
		ytypObject += '\t<numChildren value="0"/>\n'
		ytypObject += '\t<ambientOcclusionMultiplier value="255"/>\n'
		ytypObject += '\t<artificialAmbientOcclusion value="255"/>\n'
		ytypObject += '</Item>\n'
	}

  document.getElementById('ytypResult').value = ytypObject
}




document.addEventListener('DOMContentLoaded', (event) => {

	setProjectState()

	document.getElementById('processMLOInfoButton').onclick = () =>{
		processMLOData()
	}

	document.getElementById('exportYTYPButton').onclick = () =>{
		activeState	= 4
		createYtypExport(propsData)
		setProjectState()
	}
	
	for(i=0; i < mloInputsIdArray.length; i++){
		document.getElementById(mloInputsIdArray[i]).addEventListener('input', function (evt) {
			console.log(this.value);
		});
	}

	// Disable arrow up/down keys to prevent increasing/decreasing the value of the input field
	document.addEventListener('keydown', function(event) {
		if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && event.target.id !== 'ytypResult') {
			event.preventDefault();
		}
	});


	manageTooltips()
	

	let dragFile = document.getElementById('dropArea')

	dragFile.addEventListener('drop', (event) => {
		console.log('HTML drop event started');
		event.preventDefault()
		event.stopPropagation()

		let file = event.dataTransfer.files[0]
		if(file){
			ipcRenderer.send('onDragStart', file.path)
			document.getElementById('dropArea').style.display = 'none'
			document.getElementById('bufferAnimation').style.display = 'block'
			dragFile.setAttribute('draggable', false);
		}
	})

	dragFile.addEventListener('dragover', (event) => {
		event.preventDefault()
		event.stopPropagation()
	})
	
	ipcRenderer.on('fileProcessingStatus', (event, data) => {
		if(data[0] == true){
			console.log(data);
			propsData = data[1]
			activeState = 3 
			setProjectState()
			createObjectListing()
			document.getElementById('dropArea').style.display = 'flex'
			document.getElementById('bufferAnimation').style.display = 'none'
			dragFile.setAttribute('draggable', true);	
		}
		else{
			document.getElementById('dropArea').style.display = 'flex'
			document.getElementById('bufferAnimation').style.display = 'none'
			dragFile.setAttribute('draggable', true);	
		}
	})
})