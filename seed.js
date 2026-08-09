const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@desarpro.com';
  const password = 'Administrador01';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Usuario admin ya existe');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, passwordHash, role: 'admin' } });
  console.log('Usuario admin creado:', email);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
