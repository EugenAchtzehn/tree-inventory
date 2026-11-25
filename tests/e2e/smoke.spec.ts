import { expect, test } from '@playwright/test'

test('demo user can sign in and open the inventory menu', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('demo@tree.tw')
  await page.getByLabel('密碼').fill('TreeDemo123!')
  await page.getByRole('button', { name: '登入' }).click()
  await expect(page).toHaveURL(/\/map/)
  await page.getByRole('button', { name: '開啟功能選單' }).click()
  await expect(page.getByRole('link', { name: '帳戶管理' })).toBeVisible()
  await expect(page.getByRole('link', { name: '已盤點樹木' })).toBeVisible()
  await expect(page.getByRole('button', { name: '登出' })).toBeVisible()
})
