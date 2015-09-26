const config = {
	pageTitle: "Bob Alan",
	pageSubTitle: "UX Designer",
	profilePic: "images/profile-pic.png",
	aboutMe: "Ad leggings keytar, brunch id art party dolor labore. Pitchfork yr enim lo-fi before they sold out qui.",
	excludedGeneratedPages: ["resume"],
	excludedMenuItems: ["home"],
	displayDefaultHomePage: true,
	resumeLink: "/contents/resume/resume.pdf",
	knownTemplateMappings: {
		"my work": "scrolling-page",
		"home": "home",
		"extras": "master-detail",
		"writing": "master-detail"
	},
	menuItemsOrder: {
		"my work": 1,
		"resume": 2,
		"writing": 3,
		"extras": 4
	} 
};

export default config;