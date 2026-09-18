/**
 * Mock Team & Roles API for Settings
 */

const teamMembers = [
  {
    id: 'usr-1',
    name: 'Dr. Jasur Azimov',
    initials: 'JA',
    role: 'Egasi',
    roleType: 'owner',
    title: 'Bosh shifokor • Implantolog',
    email: 'j.azimov@dentuz.uz',
    phone: '+998 90 123 45 67',
    branch: 'Markaziy Klinika',
    status: 'online'
  },
  {
    id: 'usr-2',
    name: 'Dr. Malika Saidova',
    initials: 'MS',
    role: 'Shifokor',
    roleType: 'doctor',
    title: 'Ortodont',
    email: 'm.saidova@dentuz.uz',
    phone: '+998 93 319 44 28',
    branch: 'Markaziy Klinika',
    status: 'online'
  },
  {
    id: 'usr-3',
    name: 'Dr. Jamshid Karimov',
    initials: 'JK',
    role: 'Shifokor',
    roleType: 'doctor',
    title: 'Terapevt-Stomatolog',
    email: 'j.karimov@dentuz.uz',
    phone: '+998 97 711 09 85',
    branch: 'Chilonzor filiali',
    status: 'offline'
  },
  {
    id: 'usr-4',
    name: 'Nilufar Rahimova',
    initials: 'NR',
    role: 'Hamshira',
    roleType: 'nurse',
    title: 'Bosh assistent • Hamshira',
    email: 'n.rahimova@dentuz.uz',
    phone: '+998 91 445 22 19',
    branch: 'Markaziy Klinika',
    status: 'online'
  },
  {
    id: 'usr-5',
    name: 'Bobur Mirzayev',
    initials: 'BM',
    role: 'Administrator',
    roleType: 'admin',
    title: 'Boshqaruvchi direktor',
    email: 'b.mirzayev@dentuz.uz',
    phone: '+998 99 812 60 70',
    branch: 'Barcha filiallar',
    status: 'offline'
  },
  {
    id: 'usr-6',
    name: 'Shahnoza Aliyeva',
    initials: 'SA',
    role: 'Administrator',
    roleType: 'admin',
    title: 'Kassir-Registrator',
    email: 'sh.aliyeva@dentuz.uz',
    phone: '+998 90 998 12 34',
    branch: 'Markaziy Klinika',
    status: 'online'
  },
  {
    id: 'usr-7',
    name: 'Otabek Soliyev',
    initials: 'OS',
    role: 'Assistent',
    roleType: 'assistant',
    title: 'Rentgen laborant',
    email: 'o.soliyev@dentuz.uz',
    phone: '+998 94 650 33 22',
    branch: 'Markaziy Klinika',
    status: 'offline'
  },
  {
    id: 'usr-8',
    name: 'Dilnoza Karimova',
    initials: 'DK',
    role: 'Administrator',
    roleType: 'admin',
    title: 'Mijozlar bilan aloqa menejeri',
    email: 'd.karimova@dentuz.uz',
    phone: '+998 93 502 11 88',
    branch: 'Markaziy Klinika',
    status: 'online'
  }
];

export const teamApi = {
  async getTeam() {
    await new Promise((r) => setTimeout(r, 150));
    return [...teamMembers];
  },

  async addMember(member) {
    await new Promise((r) => setTimeout(r, 250));
    const created = {
      ...member,
      id: `usr-${Date.now()}`,
      initials: member.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .substring(0, 2)
        .toUpperCase(),
      status: 'offline'
    };
    teamMembers.push(created);
    return created;
  }
};
