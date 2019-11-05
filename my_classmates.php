<?php include('header_dashboard.php'); ?>
<?php include('session.php'); ?>
<?php $get_id = $_GET['id']; ?>
    <body>
		<?php include('navbar_student.php'); ?>
        <div class="container-fluid">
            <div class="row-fluid">
				<?php include('my_classmates_link.php'); ?>
                <div class="span9" id="content">
                     <div class="row-fluid">
					     <!-- breadcrumb -->
					<?php $query = mysqli_query($conn,"select * from teacher_class_student
					LEFT JOIN teacher_class ON teacher_class.teacher_class_id = teacher_class_student.teacher_class_id
					JOIN class ON class.class_id = teacher_class.class_id
					JOIN subject ON subject.subject_id = teacher_class.subject_id
					where student_id = '$session_id'
					")or die(mysqli_error());
					$row = mysqli_fetch_array($query);
					$id = $row['teacher_class_student_id'];
					?>
					     <ul class="breadcrumb">
							<li><a href="#"><?php echo $row['class_name']; ?></a> <span class="divider">/</span></li>
							<li><a href="#"><?php echo $row['subject_code']; ?></a> <span class="divider">/</span></li>
							<li><a href="#">School Year: <?php echo $row['school_year']; ?></a> <span class="divider">/</span></li>
							<li><a href="#"><b>My Classmates</b></a></li>
						</ul>

						 <!-- end breadcrumb -->

                        <!-- block -->
                        <div id="block_bg" class="block">
                            <div class="navbar navbar-inner block-header">
                                <div id="" class="muted pull-left"></div>
                            </div>
                            <div class="block-content collapse in">
                                <div class="span12">
									<ul	 id="da-thumbs" class="da-thumbs">
										    <?php


														$my_student = mysqli_query($conn,"SELECT *
														FROM teacher_class_student
														LEFT JOIN student ON student.student_id = teacher_class_student.student_id
														INNER JOIN class ON class.class_id = student.class_id where teacher_class_id = '$get_id' order by lastname ")or die(mysqli_error());

														while($row = mysqli_fetch_array($my_student)){
														$id = $row['teacher_class_student_id'];
														?>

											<li id="del<?php echo $id; ?>">
												<a  class="classmate_cursor" href="#">
														<img id="student_avatar_class" src ="admin/<?php echo $row['location'] ?>" width="124" height="140" class="img-polaroid">
													<div><span></span></div>
												</a>
												<p class="class"><?php echo $row['lastname'];?></p>
												<p class="subject"><?php echo $row['firstname']; ?></p>
											</li>
									<?php } ?>
									</ul>
                            </tbody>
                        </table>

                                </div>
                            </div>
                        </div>
                        <!-- /block -->
                    </div>


                </div>

            </div>
		<?php include('footer.php'); ?>
        </div>
		<?php include('script.php'); ?>
    </body>
</html>
