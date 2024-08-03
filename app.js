document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("myForm"),
        imgInput = document.querySelector(".img"),
        file = document.getElementById("imgInput"),
        userName = document.getElementById("name"),
        age = document.getElementById("age"),
        city = document.getElementById("city"),
        email = document.getElementById("email"),
        phone = document.getElementById("phone"),
        post = document.getElementById("post"),
        sDate = document.getElementById("sDate"),
        submitBtn = document.querySelector(".submit"),
        userInfo = document.getElementById("data"),
        modal = document.getElementById("userForm"),
        modalTitle = document.querySelector("#userForm .modal-title"),
        newUserBtn = document.querySelector(".newUser"),
        searchInput = document.getElementById("search"),
        tableSize = document.getElementById("table_size"),
        paginationWrapper = document.querySelector(".pagination"),
        showEntriesText = document.querySelector(".showEntries"),
        emptyRow = document.querySelector(".empty");

    let getData = JSON.parse(localStorage.getItem('userProfile')) || [];
    let isEdit = false, editId;
    let currentPage = 1;
    let rows = 10;
    let maxVisiblePages = 3;

    // Fetch employee data from JSON file
    fetch('employees.json')
        .then(response => {
            console.log('Fetch response:', response);
            return response.json();
        })
        .then(data => {
            console.log('Fetched data:', data);
            if (!localStorage.getItem('userProfile')) {
                getData = data;
                localStorage.setItem('userProfile', JSON.stringify(getData));
            } else {
                getData = JSON.parse(localStorage.getItem('userProfile'));
            }
            showInfo(getData);
        })
        .catch(error => console.error('Error fetching the JSON:', error));

    newUserBtn.addEventListener('click', () => {
        submitBtn.innerText = 'Submit';
        modalTitle.innerText = "Fill the Form";
        isEdit = false;
        imgInput.src = "./image/Profile Icon.webp";
        form.reset();
    });

    file.onchange = function () {
        if (file.files[0].size < 1000000) { // 1MB = 1000000
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                imgUrl = e.target.result;
                imgInput.src = imgUrl;
            }
            fileReader.readAsDataURL(file.files[0]);
        } else {
            alert("This file is too large!");
        }
    };

    function showInfo(data = getData, page = 1, rowsPerPage = rows) {
        userInfo.innerHTML = "";
        document.querySelectorAll('.employeeDetails').forEach(info => info.remove());
    
        let start = (page - 1) * rowsPerPage;
        let end = start + rowsPerPage;
        let paginatedItems = data.slice(start, end);
    
        paginatedItems.forEach((element, index) => {
            let createElement = `<tr class="employeeDetails" data-category="${element.employeePost}">
                <td>${start + index + 1}</td>
                <td><img src="${element.picture}" alt="" width="50" height="50"></td>
                <td>${element.employeeName}</td>
                <td>${element.employeeAge}</td>
                <td>${element.employeeCity}</td>
                <td>${element.employeeEmail}</td>
                <td>${element.employeePhone}</td>
                <td>${element.employeePost}</td>
                <td>${element.startDate}</td>
                <td>
                    <button class="btn btn-success" onclick="readInfo('${element.picture}', '${element.employeeName}', '${element.employeeAge}', '${element.employeeCity}', '${element.employeeEmail}', '${element.employeePhone}', '${element.employeePost}', '${element.startDate}')" data-bs-toggle="modal" data-bs-target="#readData"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-primary" onclick="editInfo(${start + index}, '${element.picture}', '${element.employeeName}', '${element.employeeAge}', '${element.employeeCity}', '${element.employeeEmail}', '${element.employeePhone}', '${element.employeePost}', '${element.startDate}')" data-bs-toggle="modal" data-bs-target="#userForm"><i class="bi bi-pencil-square"></i></button>
                    <button class="btn btn-danger" onclick="deleteInfo(${start + index})"><i class="bi bi-trash"></i></button>
                </td>
            </tr>`;
            userInfo.innerHTML += createElement;
        });
    
        if (data.length === 0) {
            emptyRow.style.display = 'table-row';
        } else {
            emptyRow.style.display = 'none';
        }
    
        let totalEntries = data.length;
        let endEntries = end > totalEntries ? totalEntries : end;
        showEntriesText.textContent = `Showing ${start + 1} to ${endEntries} of ${totalEntries} entries`;
    
        setupPagination(data, paginationWrapper, rowsPerPage, page, maxVisiblePages);
    
    }

    function setupPagination(items, wrapper, rowsPerPage, currentPage, maxVisiblePages) {
        wrapper.innerHTML = "";
        let pageCount = Math.ceil(items.length / rowsPerPage);
        let maxLeft = (currentPage - Math.floor(maxVisiblePages / 2));
        let maxRight = (currentPage + Math.floor(maxVisiblePages / 2));

        if (maxLeft < 1) {
            maxLeft = 1;
            maxRight = maxVisiblePages;
        }

        if (maxRight > pageCount) {
            maxLeft = pageCount - (maxVisiblePages - 1);

            if (maxLeft < 1) {
                maxLeft = 1;
            }
            maxRight = pageCount;
        }

        // Previous button
        const prevButton = document.createElement('li');
        prevButton.classList.add('page-item');
        prevButton.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
        prevButton.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage = currentPage > 1 ? currentPage - 1 : 1;
            showInfo(items, currentPage, rows);
        });
        wrapper.appendChild(prevButton);

        for (let i = maxLeft; i <= maxRight; i++) {
            let btn = paginationButton(i, items);
            wrapper.appendChild(btn);
        }

        // Next button
        const nextButton = document.createElement('li');
        nextButton.classList.add('page-item');
        nextButton.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
        nextButton.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage = currentPage < pageCount ? currentPage + 1 : pageCount;
            showInfo(items, currentPage, rows);
        });
        wrapper.appendChild(nextButton);
    }

    function paginationButton(page, items) {
        let button = document.createElement('li');
        button.classList.add('page-item');
        button.innerHTML = `<a class="page-link" href="#">${page}</a>`;
        if (currentPage == page) button.classList.add('active');

        button.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage = page;
            showInfo(items, currentPage, rows);
            let currentBtn = document.querySelector('.pagination .page-item.active');
            if (currentBtn) currentBtn.classList.remove('active');
            button.classList.add('active');
        });

        return button;
    }

    let debounceTimer;
    function handleFilterClick(filterValue) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (filterValue === 'All') {
                const storedData = localStorage.getItem('userProfile');
                if (storedData) {
                    getData = JSON.parse(storedData);
                } else {
                    console.warn('No data found in localStorage');
                    getData = [];
                }
                currentPage = 1;
            } else {
                const storedData = localStorage.getItem('userProfile');
                if (storedData) {
                    const allData = JSON.parse(storedData);
                    const filteredData = allData.filter(user =>
                        user.employeePost.toLowerCase().includes(filterValue.toLowerCase())
                    );
                    getData = filteredData;
                } else {
                    console.warn('No data found in localStorage');
                    getData = [];
                }
            }
            showInfo(getData, currentPage, rows);
        }, 300); // 300ms debounce delay
    }
    

    const filterButtons = document.querySelectorAll('.filter-box');
    filterButtons.forEach(button => {
        button.removeEventListener('click', handleFilterClick);
        button.addEventListener('click', () => handleFilterClick(button.dataset.filter));
    });

    searchInput.addEventListener('input', () => {
        let filteredData = getData.filter(user =>
            user.employeeName.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            user.employeeCity.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            user.employeePost.toLowerCase().includes(searchInput.value.toLowerCase())
        );
        showInfo(filteredData);
        
    });

    tableSize.addEventListener('change', (e) => {
        rows = Number(e.target.value);
        showInfo(getData, currentPage, rows);
    });

    window.readInfo = function (pic, name, age, city, email, phone, post, sDate) {
        document.querySelector('.showImg').src = pic;
        document.querySelector('#showName').value = name;
        document.querySelector("#showAge").value = age;
        document.querySelector("#showCity").value = city;
        document.querySelector("#showEmail").value = email;
        document.querySelector("#showPhone").value = phone;
        document.querySelector("#showPost").value = post;
        document.querySelector("#showsDate").value = sDate;
    }

    window.editInfo = function (index, pic, name, Age, City, Email, Phone, Post, Sdate) {
        isEdit = true;
        editId = index;
        imgInput.src = pic;
        userName.value = name;
        age.value = Age;
        city.value = City;
        email.value = Email;
        phone.value = Phone;
        post.value = Post;
        sDate.value = Sdate;

        submitBtn.innerText = "Update";
        modalTitle.innerText = "Update The Form";
    }

    window.deleteInfo = function (index) {
        if (confirm("Are you sure want to delete?")) {
            getData.splice(index, 1);
            localStorage.setItem("userProfile", JSON.stringify(getData));
            showInfo();
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const information = {
            picture: imgInput.src == undefined ? "./image/Profile Icon.webp" : imgInput.src,
            employeeName: userName.value,
            employeeAge: age.value,
            employeeCity: city.value,
            employeeEmail: email.value,
            employeePhone: phone.value,
            employeePost: post.value,
            startDate: sDate.value
        }

        if (!isEdit) {
            getData.push(information);
        } else {
            isEdit = false;
            getData[editId] = information;
        }

        localStorage.setItem('userProfile', JSON.stringify(getData));

        submitBtn.innerText = "Submit";
        modalTitle.innerHTML = "Fill The Form";

        showInfo();

        form.reset();
        imgInput.src = "./image/Profile Icon.webp";
        modal.style.display = "none";
        document.querySelector(".modal-backdrop").remove();
    });

// Handle dark mode toggle
 const darkModeSwitch = document.getElementById('darkModeSwitch');
 const body = document.body;

 darkModeSwitch.addEventListener('change', () => {
    if (darkModeSwitch.checked) {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
 });
});

