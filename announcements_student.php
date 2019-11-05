<?php include('header_dashboard.php'); ?>
<?php include('session.php'); ?>
<?php $get_id = $_GET['id']; ?>
    <body>
		<?php include('navbar_student.php'); ?>
        <div class="container-fluid">
            <div class="row-fluid">
				<?php include('annoucement_link_student.php'); ?>
                <div class="span9" id="content">
                     <div class="row-fluid">
					  <!-- breadcrumb -->

										<?php $class_query = mysqli_query($conn,"select * from teacher_class
										LEFT JOIN class ON class.class_id = teacher_class.class_id
										LEFT JOIN subject ON subject.subject_id = teacher_class.subject_id
										where teacher_class_id = '$get_id'")or die(mysqli_error());
										$class_row = mysqli_fetch_array($class_query);
										?>

					     <ul class="breadcrumb">
							<li><a href="#"><?php echo $class_row['class_name']; ?></a> <span class="divider">/</span></li>
							<li><a href="#"><?php echo $class_row['subject_code']; ?></a> <span class="divider">/</span></li>
							<li><a href="#"><b>Announcements</b></a></li>
						</ul>
						 <!-- end breadcrumb -->

                        <!-- block -->
                        <div id="block_bg" class="block">
                            <div class="navbar navbar-inner block-header">
                                <div id="" class="muted pull-left"></div>
                            </div>
                            <div class="block-content collapse in">
                                <div class="span12">
								 <?php
								 $query_announcement = mysqli_query($conn,"select * from teacher_class_announcements
																	where  teacher_class_id = '$get_id' order by date DESC
																	")or die(mysql_error());
								$count = mysqli_num_rows($query_announcement);
								if ($count > 0){
								 while($row = mysqli_fetch_array($query_announcement)){
								 $id = $row['teacher_class_announcements_id'];
								 ?>
											<div class="post"  id="del<?php echo $id; ?>">
											<?php echo $row['content']; ?>

											<hr>


											<strong><i class="icon-calendar"></i> <?php echo $row['date']; ?></strong>



											</div>

								<?php }}else{ ?>
								<div class="alert alert-info"><i class="icon-info-sign"></i> No Announcements Found.</div>
								<?php } ?>
                                </div>


                            </div>
                        </div>
                        <!-- /block -->
                    </div>


                </div>



					<script type="text/javascript">
	$(document).ready( function() {


		$('.remove').click( function() {

		var id = $(this).attr("id");
			$.ajax({
			type: "POST",
			url: "remove_announcements.php",
			data: ({id: id}),
			cache: false,
			success: function(html){
			$("#del"+id).fadeOut('slow', function(){ $(this).remove();});
			$('#'+id).modal('hide');
			$.jGrowl("Your Post is Successfully Deleted", { header: 'Data Delete' });

			}
			});

			return false;
		});
	});

</script>

                </div>


            </div>





		<?php include('footer.php'); ?>
        </div>
		<?php include('script.php'); ?>
    </body>
</html>
