export const UNN_CAMPUS_DATA: Record<string, string[]> = {
  "Faculty of Agriculture": [
    "Agricultural Economics",
    "Agricultural Extension",
    "Animal Science",
    "Crop Science",
    "Food Science & Technology",
    "Soil Science",
    "Home Science",
  ],
  "Faculty of Arts": [
    "Archeology & Tourism",
    "English & Literary Studies",
    "Fine & Applied Arts",
    "Foreign Languages & Literary Studies",
    "History & International Studies",
    "Linguistics, Igbo & Other Nigerian Languages",
    "Mass Communication",
    "Music",
    "Theatre & Film Studies",
  ],
  "Faculty of Biological Sciences": [
    "Biochemistry",
    "Microbiology",
    "Plant Science & Biotechnology",
    "Zoology & Environmental Biology",
    "Molecular Genetics & Biotechnology",
  ],
  "Faculty of Education": [
    "Adult Education & Extra-Mural Studies",
    "Arts Education",
    "Computer & Robotic Education",
    "Educational Foundations",
    "Human Kinetics & Health Education",
    "Library & Information Science",
    "Science Education",
    "Social Science Education",
  ],
  "Faculty of Engineering": [
    "Agricultural & Bioresources Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Electronic and Computer Engineering",
    "Mechanical Engineering",
    "Metallurgical & Materials Engineering",
  ],
  "Faculty of Pharmaceutical Sciences": ["Pharmacy"],
  "Faculty of Physical Sciences": [
    "Computer Science",
    "Geology",
    "Mathematics",
    "Physics & Astronomy",
    "Pure & Industrial Chemistry",
    "Statistics",
  ],
  "Faculty of Social Sciences": [
    "Economics",
    "Geography",
    "Philosophy",
    "Political Science",
    "Psychology",
    "Public Administration & Local Government",
    "Religion & Cultural Studies",
    "Sociology & Anthropology",
  ],
  "Faculty of Veterinary Medicine": ["Veterinary Medicine"],
};

/**
 * Programme duration (years of study) per faculty.
 * Used to determine finalist year for CGAN fee calculation.
 */
export const UNN_COURSE_YEARS: Record<string, number> = {
  "Faculty of Agriculture": 5,
  "Faculty of Arts": 4,
  "Faculty of Biological Sciences": 4,
  "Faculty of Education": 4,
  "Faculty of Engineering": 5,
  "Faculty of Pharmaceutical Sciences": 5,
  "Faculty of Physical Sciences": 4,
  "Faculty of Social Sciences": 4,
  "Faculty of Veterinary Medicine": 6,
};

/** Get the number of years of study for a given faculty. Defaults to 4. */
export function getYearsOfStudy(faculty: string | null | undefined): number {
  if (!faculty) return 4;
  return UNN_COURSE_YEARS[faculty] ?? 4;
}

/** Check if a user role qualifies as alumnus (no annual session dues) */
export function isAlumnus(role: string | null | undefined): boolean {
  return role === "alumnus";
}

/** Check if profile has the minimum required fields completed */
export function isProfileComplete(profile: {
  faculty?: string | null;
  department?: string | null;
  academic_level?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
} | null): boolean {
  if (!profile) return false;
  return !!(
    profile.faculty &&
    profile.department &&
    profile.academic_level &&
    profile.phone &&
    profile.date_of_birth
  );
}

export const UNN_HOSTELS = [
  "Alvan Ikoku Hostel",
  "Eni-Njoku Hostel",
  "Kwame Nkrumah Hostel",
  "Sir Odumegwu Ojukwu Hostel",
  "Balewa Hostel",
  "Bello Hostel",
  "Eyo Ita Hostel",
  "Mary Slessor Hostel",
  "Okeke Hostel",
  "Okpara Hostel",
  "Zik's Flat",
  "Presidential Hostel",
  "Aja Nwachukwu Hostel",
  "Off Campus",
];

export function getDuesAmount(
  academicLevel: string,
  faculty?: string | null,
): number {
  switch (academicLevel) {
    case "100 Level":
      return 500;
    case "200 Level":
      return 400;
    case "300 Level":
      return 400;
    case "400 Level":
      // Note: if course year is above four years (e.g. Engineering, Veterinary Medicine, Pharmacy, Agriculture), total due is ₦400 not ₦500
      const facultyNormalized = (faculty || "").toLowerCase();
      const isAboveFourYearsCourse = [
        "engineering",
        "pharmaceutical sciences",
        "veterinary medicine",
        "agriculture",
        "faculty of engineering",
        "faculty of pharmaceutical sciences",
        "faculty of veterinary medicine",
        "faculty of agriculture",
      ].some((val) => facultyNormalized.includes(val));
      return isAboveFourYearsCourse ? 400 : 500;
    case "500 Level":
      return 400;
    case "Graduate":
    case "Postgraduate":
      return 300;
    default:
      return 400;
  }
}

export const EXCO_POSITIONS = [
  "President",
  "Vice-President",
  "General Secretary",
  "Assistant General Secretary",
  "Financial Secretary",
  "Treasurer",
  "Religious Coordinator",
  "Assistant Religious Coordinator",
  "Director of Socials",
  "Assistant Director of Socials",
  "Director of Works",
  "Assistant Director of Works",
  "Director of Transport",
  "Assistant Director of Transport",
  "General Public Relations Officer (GPRO)",
  "Female Public Relations Officer (FPRO)",
  "Annunciation Public Relations Officer",
  "Assistant Annunciation Public Relations Officer",
  "Academic Coordinator",
  "Assistant Academic Coordinator",
  "Director of Hostel and Faculty Affairs",
  "Assistant Director of Hostel and Faculty Affairs",
  "Ex-Officio Member",
] as const;

export type ExcoPosition = typeof EXCO_POSITIONS[number];

export const NFCS_SOCIETIES = [
  "St Anthony of Padua",
  "Blue Army",
  "Jesus Reigns Charismatic Renewal",
  "Divine Mercy",
  "Precious Blood",
  "Our Lady of Perpetual Help",
  "Legion of Mary",
  "Purgatory Society",
  "St Vincent De Paul",
  "St Jude Society",
  "Block Rosary",
  "Queen of All Hearts",
  "St Theresa of the Child Jesus",
  "Sacred Heart of Jesus",
  "Student Altar Servers",
  "Altar Girls",
  "Lectors",
  "Student Choirs",
  "Cantors",
  "Student Church Warden",
  "Student Board of Commentators",
  "Gospel Band",
  "Social Communication Commission (SCC)",
  "Evangelical Committee (Evancom)",
  "Decency & Disciplinary Committee (DDC)",
  "Federation Theatre (FT)",
  "Faculty of Education Catholic Students Assoc. (FECSA)",
  "Veterinary Catholic Students Assoc. (VECSA)",
  "Catholic Assoc. of Social Science Students (CASSS)",
  "Assoc. of Catholic Agricultural Students (ACAS)",
  "Assoc. of Catholic Engineering Students (ACES)",
  "Catholic Assoc. of Biological Science Students (CABSS)",
  "Faculty of Arts Catholic Students Assoc. (FACSA)",
  "Catholic Pharmaceutical Students Assoc. (CAPSAN)",
  "Physical Science Students Catholic Assoc. (PHYSSCA)",
  "Vocational & Technical Education Catholic Assoc. (VOTECSA)",
  "Federation of Catholic Medical & Dentistry Students (FECAMDS)",
  "First Year Catholic Assoc. of Basic Medical Sciences (FYCABAMS)",
  "First Year Catholic Health Science Students Assoc. (FYCAHSSA)",
] as const;

export type NfcsSociety = typeof NFCS_SOCIETIES[number];

