/**
 * Console-friendly migration functions
 * Run these directly from Apps Script console
 */

function consolePreviewMigration() {
  Logger.log('\n===========================================');
  Logger.log('PREVIEW MIGRATION (Console Mode)');
  Logger.log('===========================================\n');

  try {
    const result = AdminMigration.migrateLegacyTool1(true);

    Logger.log('RESULTS:');
    Logger.log('--------');
    Logger.log(`Total students in destination: ${result.totalStudents}`);
    Logger.log(`Will process: ${result.processed}`);
    Logger.log(`  - Matched by Student ID: ${result.matchedByStudentId}`);
    Logger.log(`  - Matched by Name: ${result.matchedByName}`);
    Logger.log(`Will skip: ${result.skipped}`);
    Logger.log(`Errors: ${result.errors}`);

    Logger.log('\n========== FIRST 10 STUDENTS ==========\n');

    result.details.slice(0, 10).forEach((detail, index) => {
      Logger.log(`${index + 1}. ${detail.clientId} - ${detail.name}`);
      if (detail.status === 'preview') {
        Logger.log(`   ✓ Matched by: ${detail.matchMethod}`);
        Logger.log(`   Winner: ${detail.winner}`);
        Logger.log(`   Scores: FSV=${detail.scores.FSV}, ExVal=${detail.scores.ExVal}, Control=${detail.scores.Control}`);
      } else if (detail.status === 'skipped') {
        Logger.log(`   ⚠️ SKIPPED: ${detail.reason}`);
      }
      Logger.log('');
    });

    Logger.log('\n===========================================');
    Logger.log('PREVIEW COMPLETE - No data written');
    Logger.log('===========================================\n');

    if (result.errors === 0 && result.processed > 0) {
      Logger.log('✅ Preview looks good! Ready to run actual migration.');
      Logger.log('   Next: Run consoleRunMigration()');
    } else {
      Logger.log('⚠️ Review results above before proceeding.');
    }

    return result;

  } catch (error) {
    Logger.log('\n❌ ERROR:');
    Logger.log(error.toString());
    Logger.log(error.stack);
  }
}

function consoleRunMigration() {
  Logger.log('\n===========================================');
  Logger.log('⚠️  RUNNING ACTUAL MIGRATION ⚠️');
  Logger.log('===========================================\n');
  Logger.log('This WRITES data to RESPONSES sheet.');
  Logger.log('Processing...\n');

  try {
    const result = AdminMigration.migrateLegacyTool1(false);

    Logger.log('\n===========================================');
    Logger.log('MIGRATION COMPLETE!');
    Logger.log('===========================================\n');
    Logger.log(`Total students: ${result.totalStudents}`);
    Logger.log(`Migrated: ${result.processed}`);
    Logger.log(`  - Matched by Student ID: ${result.matchedByStudentId}`);
    Logger.log(`  - Matched by Name: ${result.matchedByName}`);
    Logger.log(`Skipped: ${result.skipped}`);
    Logger.log(`Errors: ${result.errors}`);

    if (result.errors > 0) {
      Logger.log('\n⚠️ Some records had errors. Review logs above.');
    } else if (result.processed > 0) {
      Logger.log('\n✅ All records migrated successfully!');
      Logger.log('\nNext steps:');
      Logger.log('1. Check RESPONSES sheet (filter Tool_ID = tool1)');
      Logger.log('2. Spot-check 2-3 student records');
      Logger.log('3. Test Tool 2 integration (name/email pre-fill)');
    } else {
      Logger.log('\nℹ️ No new records to migrate.');
    }

    return result;

  } catch (error) {
    Logger.log('\n❌ MIGRATION ERROR:');
    Logger.log(error.toString());
    Logger.log(error.stack);
  }
}
