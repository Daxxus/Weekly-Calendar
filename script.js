class Calendar {
	constructor() {
		this.calend = document.querySelector("#container")
		this.calendar = document.querySelector("#calendar")
		this.spans = [...document.querySelectorAll("#weekdays span")]
		this.modalClickedCell = document.querySelector("#modalContainer")
		this.modalClickedButton = document.querySelector("#modalContainer2")
		this.addModal = document.querySelector("#addModal")
		this.addNote = document.querySelector("#add")
		this.cancelNote = document.querySelector("#cancel")

		this.allModalInputs = document.querySelectorAll(
			"#modalContainer2 #form input"
		)
		this.modalInputs = document.querySelectorAll("#modalContainer input")
		this.inputTitle = document.querySelector("#evenTitle")
		this.inputStart = document.querySelector("#dateStart")
		this.inputEnd = document.querySelector("#dateEnd")
		this.pastTime = document.querySelectorAll('[type="datetime-local"]')

		this.nav = 0
		this.week = 7
		this.dayNumber = 1

		this.notesEvents = localStorage.getItem("note2")
			? JSON.parse(localStorage.getItem("note2"))
			: []

		this.eventTitle2 = document.querySelector("#evenTitle2")
		this.dateStart2 = document.querySelector("#dateStart2")
		this.dateEnd2 = document.querySelector("#dateEnd2")
		this.startApp()
	}
	startApp() {
		this.loadDays()
		this.initButtons()
		this.currentDay()
		this.disablePastDate()
		this.listeners()
	}

	loadDays = () => {
		this.dayNumber = 1
		const today = new Date()

		if (this.nav !== 0) {
			today.setDate(new Date().getDate() + this.nav) // zwraca poszcz msc do paginacji
		}
		const day = today.getDate()
		this.month = today.getMonth()
		this.year = today.getFullYear()

		function getFirstDayOfWeek(d) {
			const date = new Date(d)
			const day = date.getDay() // 👉️ get day of week
			// 👇️ day of month - day of week (-6 if Sunday), otherwise +1
			const diff = date.getDate() - day + (day === 0 ? -6 : 1)

			return new Date(date.setDate(diff))
		}

		const firstDay = getFirstDayOfWeek(today)
		let firstDateString = firstDay.getDate()
		// let firstMonth = firstDay.getMonth() + 1

		this.monthTxt = firstDay.toLocaleDateString()
		this.monthTxt = this.monthTxt.split(".")[1]

		function dateIsValid(dateStr) {
			const regex = /^\d{2}\/\d{2}\/\d{4}$/

			if (dateStr.match(regex) === null) {
				return false
			}

			const [day, months, year] = dateStr.split("/")
			// 👇️ format Date string as `yyyy-mm-dd`
			const isoFormattedStr = `${year}-${months}-${day}`
			const date = new Date(isoFormattedStr)
			const timestamp = date.getTime()

			if (typeof timestamp !== "number" || Number.isNaN(timestamp)) {
				return false
			}

			return date.toISOString().startsWith(isoFormattedStr)
		}

		const displayMonth = document.querySelector("#monthDisplay")
		displayMonth.innerHTML = `
		${today.toLocaleDateString("pl", { month: "long" })} ${this.year}        
		`
			.toUpperCase()
			.trim()

		this.newSpans = this.spans.map((span) => {
			span.innerHTML = firstDateString++
			if (+span.innerHTML < 10) {
				span.innerHTML = `0${+span.innerHTML}`
			}

			let validDay = dateIsValid(
				`${span.innerHTML}/${this.monthTxt}/${this.year}`
			)

			if (!validDay) {
				span.textContent = `0${this.dayNumber++}`
			}
			this.span = span.textContent
			return this.span
		})
		this.idNote = 0
		this.calendar.innerHTML = ""

		for (this.i = 8; this.i <= 20; this.i++) {
			for (this.j = 0; this.j < 5; this.j++) {
				const daySq = document.createElement("div")
				daySq.classList.add("day")
				this.calendar.append(daySq)

				this.event = this.notesEvents.find(
					(el) =>
						el.year == this.year &&
						el.month == this.month + 1 &&
						el.day == this.newSpans[this.j] &&
						el.hour == this.i
				)

				if (this.event) {
					this.div = document.createElement("div")
					this.div.classList.add("note")
					this.div.innerHTML = `
					<p>${this.event.title}</p>
					<p>Start: ${this.event.start} - End: ${this.event.end}</p>
					`
					daySq.append(this.div)
				}

				
				daySq.addEventListener("click", (e) => {
					this.showModal(e)
					this.target = e.target
				})
				this.each = daySq
			}
		}
		console.log(this.notesEvents)
	}

	note = () => {
		this.target.innerHTML = ""
		if (
			this.inputTitle.value === "" ||
			this.inputStart.value === "" ||
			this.inputEnd.value === ""
		)
			return

		const noteObj = {
			title: this.inputTitle.value,
			start: this.inputStart.value.slice(-5),
			end: this.inputEnd.value.slice(-5),
			year: this.inputStart.value.slice(-0, 4),
			month: this.inputStart.value.slice(5, 7),
			day: this.inputStart.value.slice(8, 10),
			hour: this.inputStart.value.slice(-5, -3),
		}

		this.notesEvents.push(noteObj)
		localStorage.setItem("note2", JSON.stringify(this.notesEvents))
		this.loadDays()

		this.modalClickedCell.style.display = "none"
		this.modalInputs.forEach((each) => (each.value = ""))
	}

	note2 = () => {
		this.each.innerHTML = ""
		if (
			this.eventTitle2.value === "" ||
			this.dateStart2.value === "" ||
			this.dateEnd2.value === ""
		)
			return

		const noteObj = {
			title: this.eventTitle2.value,
			start: this.dateStart2.value.slice(-5),
			end: this.dateEnd2.value.slice(-5),
			year: this.dateStart2.value.slice(0, 4),
			month: this.dateStart2.value.slice(5, 7),
			day: this.dateStart2.value.slice(8, 10),
			hour: this.dateStart2.value.slice(-5, -3),
			// id: this.notesEvents.length, //wazne do usuwania
		}

		this.notesEvents.push(noteObj)
		localStorage.setItem("note2", JSON.stringify(this.notesEvents))

		this.loadDays()

		this.modalClickedButton.style.display = "none"
		this.allModalInputs.forEach((each) => (each.value = ""))
	}

	disablePastDate = () => {
		let currentDate = new Date().toISOString()
		currentDate = currentDate.slice(0, currentDate.lastIndexOf(":"))
		this.pastTime.forEach((time) => {
			time.min = currentDate
			time.setAttribute("value", currentDate)
		})
	}

	showModal = (e) => {
		this.modalClickedCell.style.display = "block"
		if (e.target.closest("div").classList.contains("day")) {
			return
		}
		this.inputTitle.value = e.target.closest("div").firstElementChild.innerHTML
	}
	showModal2 = () => {
		this.modalClickedButton.style.display = "block"
	}
	hideModal = () => {
		this.modalClickedCell.style.display = "none"
		this.modalInputs.forEach((el) => (el.value = ""))
	}
	hideModal2 = () => {
		this.modalClickedButton.style.display = "none"
	}

	initButtons = () => {
		document.querySelector("#nextButton").addEventListener("click", () => {
			this.nav += this.week
			this.month++
			this.loadDays()
		})

		document.querySelector("#backButton").addEventListener("click", () => {
			this.nav -= this.week
			this.month--
			this.loadDays()
		})
	}
	currentDay = () => {
		document.querySelector("#today").addEventListener("click", () => {
			this.nav = 0
			this.loadDays()
		})
	}
	deleteNote = () => {
		// musi być filter a nie find bo zwraca elementy  a nie 1 element
		this.notesEvents = this.notesEvents.filter(
			(el) => el.title !== this.inputTitle.value
		)
		localStorage.setItem("note2", JSON.stringify(this.notesEvents))
		this.modalInputs.forEach((el) => (el.value = ""))
	}

	listeners = () => {
		this.cancelNote.addEventListener("click", this.hideModal)
		this.addNote.addEventListener("click", this.note)
		this.addModal.addEventListener("click", this.showModal2)
		document
			.querySelector("#cancel2")
			.addEventListener("click", this.hideModal2)
		document.querySelector("#add2").addEventListener("click", this.note2)

		document.querySelector("#delete").addEventListener("click", () => {
			this.target.closest("div").classList.remove("note")
			this.target.closest("div").innerHTML = ""
			this.modalClickedCell.style.display = "none"
		})
		document.getElementById("delete").addEventListener("click", this.deleteNote)
		document.getElementById("clearNotes").addEventListener("click", () => {
			localStorage.clear()
			setTimeout("location.reload()", 1)
		})
	}
}
const calendar = new Calendar()
