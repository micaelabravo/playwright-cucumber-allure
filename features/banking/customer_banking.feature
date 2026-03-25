@smoke @banking @regression
Feature: Customer banking — deposits, withdrawals, and validation
  As a bank customer
  I want to move money and review activity
  So that I can trust my balance and history

  Background:
    Given the banking login page is open

  Scenario Outline: Customer deposits money and sees the transaction
    When I click "Customer Login"
    And I select customer "<customer>" from the dropdown
    And I click "Login"
    Then I should see the customer account area
    When I open the "Deposit" tab
    And I enter "<amount>" into the deposit amount field
    And I submit the deposit
    And I open the "Transactions" tab
    Then I should see a deposit transaction for amount "<amount>"

    Examples:
      | customer     | amount |
      | Harry Potter | 100    |

  @withdrawal
  Scenario: Customer withdraws money and sees a debit transaction
    When I click "Customer Login"
    And I select customer "Harry Potter" from the dropdown
    And I click "Login"
    Then I should see the customer account area
    When I open the "Deposit" tab
    And I enter "500" into the deposit amount field
    And I submit the deposit
    When I open the "Withdrawl" tab
    And I enter "100" into the withdraw amount field
    And I submit the withdraw
    And I open the "Transactions" tab
    Then I should see a withdraw transaction for amount "100"

  @negative
  Scenario: Empty deposit is blocked by the browser
    When I click "Customer Login"
    And I select customer "Harry Potter" from the dropdown
    And I click "Login"
    Then I should see the customer account area
    When I open the "Deposit" tab
    And I clear the deposit amount field
    And I submit the deposit
    Then the deposit amount field should be invalid

  @negative
  Scenario: Non-numeric deposit is not accepted
    When I click "Customer Login"
    And I select customer "Harry Potter" from the dropdown
    And I click "Login"
    Then I should see the customer account area
    When I open the "Deposit" tab
    And I type "abc" into the deposit amount field
    Then the deposit amount field should be invalid
