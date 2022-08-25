import {JavaPackage} from '../../../../../src/dataLayer/model/projectData/processed/javaPackage';
import {Metrics} from '../../../../../src/dataLayer/model/projectData/processed/javaItems/metrics';
import {JavaClass} from '../../../../../src/dataLayer/model/projectData/processed/javaItems/javaClass';

/*
 * Construction and from and to serialized object was already testet in ProcessedCompoonent
 */
describe('JavaPackage Test Suite', function() {
  test('should allow to get number of lines in package', () => {
    const metricsClass1 = new Metrics('public class Hotel {}', 15, 3, 1, ['public'], 'default', false);
    const class1 = new JavaClass('Hotel', metricsClass1);
    const metricsClass2 = new Metrics('public class Room {}', 2, 0, 0, ['public'], 'default', false);
    const class2 = new JavaClass('Room', metricsClass2);
    const pkg = new JavaPackage('');
    pkg.addJavaItem('Hotel', ['p0'], class1);
    pkg.addJavaItem('Room', ['p1'], class2);
    expect(pkg.getLineCount()).toBe(17);
  });
});
