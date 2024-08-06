let currentStartIndex = 0;
let currentEndIndex = -1;
let images_per_set = 5
let imagePairs = [];
let responses = {};

function loadImagePairs() {
    fetch('/get_image_pairs')
        .then(response => response.json())
        .then(data => {
            imagePairs = data.image_pairs;
            document.getElementById('total-pairs').textContent = imagePairs.length;
            updateProgress();
            showNextSetofPairs();
        });
}

function showNextSetofPairs() {
    if (currentStartIndex >= imagePairs.length) {
        alert('All pairs have been processed.');
        return;
    }
    currentEndIndex = (currentStartIndex + images_per_set) > imagePairs.length ? imagePairs.length : currentStartIndex + images_per_set 
    
    const mainDiv = document.getElementById('main-container');
    mainDiv.innerHTML = ``

    for(loop_index = currentStartIndex; loop_index < currentEndIndex; loop_index++) {
        mainDiv.innerHTML = mainDiv.innerHTML + `
            <div id="image-label-pair-${loop_index}" class="image-label-unit">
                <div class="image-container">
                    <img id="image-${loop_index}" src="${imagePairs[loop_index].image}" alt="Image">
                </div>
                <div class="interaction-container">
                    <div id="questions-${loop_index}">
                        Can you recognize the text from the image?
                        <br/>
                        <br/>
                        <input type="radio" name="recognize-${loop_index}" value="yes" onclick="handleRecognition(true, ${loop_index})"> Yes
                        <br/>
                        <input type="radio" name="recognize-${loop_index}" value="no" onclick="handleRecognition(false, ${loop_index})"> No
                        <br/>
                        <br/>
                        <div id="follow-up-questions-${loop_index}"></div>
                    </div>
                </div>
            </div>
            <hr>
        `;
    }
    mainDiv.innerHTML = mainDiv.innerHTML + `<button class="submit-button" id="submit" onclick="submitResponse()">Submit</button>`
    
}

function handleRecognition(recognized, loop_index) {
    const followUpDiv = document.getElementById(`follow-up-questions-${loop_index}`);
    followUpDiv.innerHTML = '';

    if (recognized) {
        followUpDiv.innerHTML = `
            Is it the same as this: <b>${imagePairs[loop_index].label}</b>?
            <br/>
            <br/>
            <input type="radio" name="same-${loop_index}" value="yes"> Yes
            <br/>
            <input type="radio" name="same-${loop_index}" value="no"> No
            <br/>
            <p id="new-label-question-${loop_index}" style="display:none;">Enter Correct Text Here: </p>
            <input type="text" id="new-label-${loop_index}" style="display:none;">
        `;
        document.querySelector(`input[name="same-${loop_index}"][value="no"]`).addEventListener('click', () => {
            document.getElementById(`new-label-${loop_index}`).style.display = 'block';
            document.getElementById(`new-label-${loop_index}`).style.fontSize = 'x-large';
            document.getElementById(`new-label-question-${loop_index}`).style.display = 'block';
            document.getElementById(`new-label-${loop_index}`).value = imagePairs[loop_index].label;
        });
        document.querySelector(`input[name="same-${loop_index}"][value="yes"]`).addEventListener('click', () => {
            document.getElementById(`new-label-${loop_index}`).style.display = 'none';
            document.getElementById(`new-label-question-${loop_index}`).style.display = 'none';
        });
    } else {
        followUpDiv.innerHTML = `
            The text is: <b>${imagePairs[loop_index].label}</b>. Now can you recognize the text?
            <br/>
            <br/>
            <input type="radio" name="now-recognize-${loop_index}" value="yes"> Yes
            <br/>
            <input type="radio" name="now-recognize-${loop_index}" value="no"> No
        `;
    }
}

function submitResponse() {
    current_set_response = {}
    for(loop_index = currentStartIndex; loop_index < currentEndIndex; loop_index++) 
    {
        const recognized = document.querySelector(`input[name="recognize-${loop_index}"]:checked`).value;
        let response = { 
            image: imagePairs[loop_index].image.split('/').slice(-1)[0],
            parseq_text: imagePairs[loop_index].label,
            recognized 
        };
    
        if (recognized === 'yes') {
            const same = document.querySelector(`input[name="same-${loop_index}"]:checked`).value;
            if (same === 'yes') {
                response.same = true;
                response.result = 'correct';
            } else {
                const newLabel = document.getElementById(`new-label-${loop_index}`).value;
                response.same = false;
                response.newLabel = newLabel;
                response.result = 'wrong';
            }
        } else {
            const nowRecognize = document.querySelector(`input[name="now-recognize-${loop_index}"]:checked`).value;
            response.nowRecognize = nowRecognize;
            response.result = nowRecognize === 'yes' ? 'correct' : 'illegible';
        }
        responses[loop_index] = response;
        current_set_response[loop_index] = response
    }
    
    currentStartIndex = currentStartIndex + 5;
    saveResponse(current_set_response);
    updateProgress();
    showNextSetofPairs();
}

function saveResponse(response) {
    fetch('/save_response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
    });
}

function updateProgress() {
    const completed = Object.keys(responses).length;
    document.getElementById('completed-pairs').textContent = completed;
    document.getElementById('remaining-pairs').textContent = imagePairs.length - completed;
}

window.onload = loadImagePairs;
