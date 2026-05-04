#!/usr/bin/env node
/**
 * setup-oauth.js
 * Configura o OAuth App no config.yml e faz deploy para produção.
 *
 * USO:
 *   node scripts/setup-oauth.js <CLIENT_ID>
 *
 * Exemplo:
 *   node scripts/setup-oauth.js Ov23liABCDEFGHIJ1234
 */

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const clientId = process.argv[2]
if (!clientId) {
  console.error('\n❌ Informe o Client ID:\n')
  console.error('   node scripts/setup-oauth.js <CLIENT_ID>\n')
  process.exit(1)
}

const configPath = resolve(root, 'public/admin/config.yml')
let config = readFileSync(configPath, 'utf-8')

// 1. Remove local_backend
config = config.replace(/^local_backend: true\n/m, '')
console.log('✅ local_backend removido')

// 2. Adiciona client_id ao backend
if (!config.includes('client_id:')) {
  config = config.replace(
    /  auth_endpoint: auth/,
    `  auth_endpoint: auth\n  client_id: ${clientId}`
  )
  console.log(`✅ client_id adicionado: ${clientId}`)
} else {
  config = config.replace(/  client_id: .+/, `  client_id: ${clientId}`)
  console.log(`✅ client_id atualizado: ${clientId}`)
}

writeFileSync(configPath, config, 'utf-8')
console.log('✅ config.yml salvo\n')

// 3. Commit e push na branch DCM-Admin
try {
  execSync('git add public/admin/config.yml', { cwd: root, stdio: 'inherit' })
  execSync(
    `git commit -m "feat(cms): configura OAuth App client_id para producao"`,
    { cwd: root, stdio: 'inherit' }
  )
  execSync('git push origin DCM-Admin', { cwd: root, stdio: 'inherit' })
  console.log('\n✅ Push para DCM-Admin concluído')
} catch (e) {
  console.error('\n⚠️  Erro no git:', e.message)
}

console.log(`
══════════════════════════════════════════════════════
✅ CONFIGURAÇÃO CONCLUÍDA

Próximo passo: merge DCM-Admin → main para fazer deploy.
Execute:

   gh pr create --base main --head DCM-Admin --title "feat: Decap CMS production" --body "Painel CMS configurado com OAuth"
   gh pr merge --merge --delete-branch

Site em produção (≈ 2 min após merge):
   https://evalente82.github.io/Curso-Mergulho-DCM/admin/
══════════════════════════════════════════════════════
`)
